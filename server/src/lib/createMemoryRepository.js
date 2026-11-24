import { randomUUID } from 'node:crypto';

/**
 * A minimal async, in-memory repository: used when no database is configured
 * (DATABASE_URL), in development. Same interface as `createPgRepository`; every
 * method is async and returns copies.
 *
 * @param {{ generateId?: () => string }} [options]
 */
export function createMemoryRepository({ generateId = randomUUID } = {}) {
  /** @type {Map<string, Record<string, any>>} */
  const records = new Map();
  const matches = (field, value) => (record) => (value == null ? record[field] == null : String(record[field]) === String(value));

  return {
    async create(data) {
      const now = new Date().toISOString();
      const record = { ...data, id: generateId(), createdAt: now, updatedAt: now };
      records.set(record.id, record);
      return structuredClone(record);
    },

    async findById(id) {
      const record = records.get(id);
      return record ? structuredClone(record) : null;
    },

    /** The first record whose `field` equals `value`. */
    async findOneBy(field, value) {
      const record = [...records.values()].find(matches(field, value));
      return record ? structuredClone(record) : null;
    },

    /** Every record whose `field` equals `value`, oldest first. */
    async findAllBy(field, value) {
      return [...records.values()].filter(matches(field, value)).map((record) => structuredClone(record));
    },

    async findAll() {
      return [...records.values()].map((record) => structuredClone(record));
    },

    async update(id, changes) {
      const existing = records.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...changes, id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
      records.set(id, updated);
      return structuredClone(updated);
    },
  };
}
