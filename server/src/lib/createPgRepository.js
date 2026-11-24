import { randomUUID } from 'node:crypto';
import { query } from '../db/pool.js';

const COLUMNS = 'id, data, created_at, updated_at';

/** A row back as a plain record, shaped exactly like the in-memory repository's. */
const toRecord = (row) => (row ? { ...row.data, id: row.id, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString() } : null);

/** What goes in `data`: the record without its id and timestamps (those are columns). */
const dataOf = ({ id: _id, createdAt: _created, updatedAt: _updated, ...data }) => data;

/**
 * A PostgreSQL-backed repository with the same interface as
 * `createMemoryRepository`: each record is a row of `table` (see db/migrations.js),
 * with the record as JSONB. Every query is parameterised; `table` comes from code.
 *
 * @param {string} table
 * @param {{ generateId?: () => string }} [options]
 */
export function createPgRepository(table, { generateId = randomUUID } = {}) {
  if (!/^[a-z_]+$/.test(table)) throw new Error(`Unexpected table name: ${table}`);

  return {
    async create(data) {
      for (let attempt = 1; ; attempt += 1) {
        try {
          const { rows } = await query(`insert into ${table} (id, data) values ($1, $2) returning ${COLUMNS}`, [generateId(), dataOf(data)]);
          return toRecord(rows[0]);
        } catch (error) {
          // Two generated ids the same (very unlikely, but order numbers are short): try another.
          if (error.code === '23505' && error.constraint === `${table}_pkey` && attempt < 4) continue;
          throw error;
        }
      }
    },

    async findById(id) {
      const { rows } = await query(`select ${COLUMNS} from ${table} where id = $1`, [id]);
      return toRecord(rows[0]);
    },

    /** The first record whose `field` equals `value`. */
    async findOneBy(field, value) {
      const { rows } =
        value == null
          ? await query(`select ${COLUMNS} from ${table} where data->>$1 is null order by created_at limit 1`, [field])
          : await query(`select ${COLUMNS} from ${table} where data->>$1 = $2 order by created_at limit 1`, [field, String(value)]);
      return toRecord(rows[0]);
    },

    /** Every record whose `field` equals `value`, oldest first. */
    async findAllBy(field, value) {
      const { rows } = await query(`select ${COLUMNS} from ${table} where data->>$1 = $2 order by created_at`, [field, String(value)]);
      return rows.map(toRecord);
    },

    async findAll() {
      const { rows } = await query(`select ${COLUMNS} from ${table} order by created_at`);
      return rows.map(toRecord);
    },

    async update(id, changes) {
      const { rows } = await query(`update ${table} set data = data || $2::jsonb, updated_at = now() where id = $1 returning ${COLUMNS}`, [id, dataOf(changes)]);
      return toRecord(rows[0]);
    },
  };
}
