import { env } from '../config/env.js';
import { MIGRATIONS } from './migrations.js';
import { pool } from './pool.js';

export { closeDb, pool, query } from './pool.js';

/** Any number, the same for every copy of the API: only one applies migrations at a time. */
const MIGRATION_LOCK = 7_204_190;

/** Applies the schema steps that haven't run yet; returns their ids. */
async function migrate() {
  const client = await pool.connect();
  const applied = [];
  try {
    await client.query('select pg_advisory_lock($1)', [MIGRATION_LOCK]);
    await client.query('create table if not exists schema_migrations (id text primary key, applied_at timestamptz not null default now())');
    const { rows } = await client.query('select id from schema_migrations');
    const done = new Set(rows.map((row) => row.id));
    for (const migration of MIGRATIONS) {
      if (done.has(migration.id)) continue;
      try {
        await client.query('begin');
        await client.query(migration.sql);
        await client.query('insert into schema_migrations (id) values ($1)', [migration.id]);
        await client.query('commit');
        applied.push(migration.id);
      } catch (error) {
        await client.query('rollback');
        throw new Error(`Database migration ${migration.id} failed: ${error.message}`, { cause: error });
      }
    }
  } finally {
    await client.query('select pg_advisory_unlock($1)', [MIGRATION_LOCK]).catch(() => {});
    client.release();
  }
  return applied;
}

/**
 * Connects to the database and brings its schema up to date, before the API
 * starts. Without `DATABASE_URL` the API keeps its data in memory — allowed in
 * development only. Never logs the connection string.
 * @returns {Promise<string>} a one-line description, for the startup log
 */
export async function initDatabase() {
  if (!pool) {
    if (env.isProduction) throw new Error('DATABASE_URL is not set. The API needs a database in production.');
    return 'none (DATABASE_URL not set) — data is kept in memory and lost on restart';
  }
  const { rows } = await pool.query("select current_database() as name, split_part(version(), ' ', 2) as version");
  const applied = await migrate();
  // Tidy up sign-ins that have run out.
  await pool.query('delete from sessions where expires_at < now()');
  const { name, version } = rows[0];
  return `PostgreSQL ${version}, database "${name}"${applied.length ? ` (applied ${applied.join(', ')})` : ''}`;
}

/** For the health check: whether the database answers. */
export async function databaseStatus() {
  if (!pool) return 'memory';
  try {
    await pool.query('select 1');
    return 'ok';
  } catch {
    return 'unreachable';
  }
}
