import { createRepository } from '../../lib/createRepository.js';

/** Shop settings, one record per `key`, with the setting itself in `value`. */
const settingsRepository = createRepository('settings');

export const settingsService = {
  /** The stored value for `key`, or `fallback` when it has never been set. */
  async get(key, fallback = null) {
    const record = await settingsRepository.findOneBy('key', key);
    return record ? record.value : fallback;
  },

  async set(key, value) {
    const record = await settingsRepository.findOneBy('key', key);
    const saved = record ? await settingsRepository.update(record.id, { value }) : await settingsRepository.create({ key, value });
    return saved.value;
  },
};
