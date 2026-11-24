import { pool } from '../db/pool.js';
import { createMemoryRepository } from './createMemoryRepository.js';
import { createPgRepository } from './createPgRepository.js';

/**
 * A repository for one collection: in PostgreSQL when DATABASE_URL is set,
 * otherwise in memory (development). Both have the same methods:
 * create, findById, findOneBy, findAllBy, findAll and update.
 *
 * @param {string} table its table in the database (see db/migrations.js)
 * @param {{ generateId?: () => string }} [options]
 */
export const createRepository = (table, options) => (pool ? createPgRepository(table, options) : createMemoryRepository(options));
