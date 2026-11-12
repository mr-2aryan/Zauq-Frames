import { randomUUID } from 'node:crypto';

/**
 * A minimal async, in-memory repository.
 *
 * Placeholder persistence until a database is chosen. Every method is async
 * and returns copies, so swapping this for a real DB-backed repository with the
 * same interface needs no changes in services or controllers.
 *
 * @param {{ generateId?: () => string }} [options]
 */
export function createMemoryRepository({ generateId = randomUUID } = {}) {
  /** @type {Map<string, Record<string, any>>} */
  const records = new Map();

  return {
    async create(data) {
      const now = new Date().toISOString();
      const record = { id: generateId(), ...data, createdAt: now, updatedAt: now };
      records.set(record.id, record);
      return structuredClone(record);
    },

    async findById(id) {
      const record = records.get(id);
      return record ? structuredClone(record) : null;
    },

    async findOne(predicate) {
      for (const record of records.values()) {
        if (predicate(record)) return structuredClone(record);
      }
      return null;
    },

    async findAll() {
      return [...records.values()].map((record) => structuredClone(record));
    },

    async update(id, changes) {
      const existing = records.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...changes, id, updatedAt: new Date().toISOString() };
      records.set(id, updated);
      return structuredClone(updated);
    },
  };
}
