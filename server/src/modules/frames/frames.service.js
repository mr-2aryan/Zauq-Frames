import { DEFAULT_FRAME_SETTINGS } from '../../db/seed.js';
import { settingsService } from '../settings/settings.service.js';
import { MATS, ORIENTATIONS } from './frames.catalog.js';

/**
 * Frame sizes and prices, from the database (settings key 'frames', edited in the
 * admin). Kept in memory between changes; `invalidate()` after saving new settings.
 */
let cached = null;

async function settings() {
  cached ??= await settingsService.get('frames', DEFAULT_FRAME_SETTINGS);
  return cached;
}

/** List price that the promotion brings down to `salePrice`, in whole rupees. */
const listPriceFor = (salePrice, percentOff) => (percentOff > 0 ? Math.round((salePrice * 100) / (100 - percentOff)) : salePrice);

/** A size with its list `price` (struck through) and `salePrice` (what customers pay). */
const withPrices = (size, percentOff) => ({ ...size, price: listPriceFor(size.salePrice, percentOff) });

export const framesService = {
  async getCatalog() {
    const { currency, deliveryFee, finish, promotion, sizes } = await settings();
    return {
      currency,
      deliveryFee,
      finish,
      orientations: ORIENTATIONS,
      mats: MATS,
      promotion,
      sizes: sizes.map((size) => withPrices(size, promotion.percentOff)),
    };
  },

  async findSizeById(id) {
    const { promotion, sizes } = await settings();
    const size = sizes.find((option) => option.id === id);
    return size ? withPrices(size, promotion.percentOff) : null;
  },

  /** The stored settings as they are (for the admin). */
  async getSettings() {
    return structuredClone(await settings());
  },

  async saveSettings(next) {
    cached = await settingsService.set('frames', next);
    return structuredClone(cached);
  },

  invalidate() {
    cached = null;
  },
};
