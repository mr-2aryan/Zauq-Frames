import pg from 'pg';
import { env } from '../config/env.js';

/**
 * The PostgreSQL connection pool, from `DATABASE_URL` — or null when it isn't
 * set, in which case the repositories keep their data in memory (development only).
 */
export const pool = env.databaseUrl
  ? new pg.Pool({
      connectionString: env.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      // For a hosted database that requires TLS (DATABASE_SSL=true).
      ...(env.databaseSsl ? { ssl: { rejectUnauthorized: true } } : {}),
    })
  : null;

// An idle connection dropping (the database restarting, say) must not crash the API.
pool?.on('error', (error) => console.error('Database connection error:', error.message));

/** Runs one parameterised query on the pool. */
export const query = (text, params) => pool.query(text, params);

export const closeDb = async () => {
  await pool?.end();
};
