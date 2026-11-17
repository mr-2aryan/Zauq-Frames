import { CURRENCY, DEFAULT_FINISH, DELIVERY_FEE, FRAME_SIZES, ORIENTATIONS, PROMOTION } from './frames.catalog.js';

/** List price that the promotion brings down to `salePrice`, in whole rupees. */
const listPriceFor = (salePrice) => Math.round((salePrice * 100) / (100 - PROMOTION.percentOff));

/** A size with its list `price` (struck through) and `salePrice` (what customers pay). */
const withPrices = (size) => ({ ...size, price: listPriceFor(size.salePrice) });

/**
 * Catalogue access. Methods are async so the static catalogue can be
 * replaced by database queries without touching callers.
 */
export const framesService = {
  async getCatalog() {
    return {
      currency: CURRENCY,
      deliveryFee: DELIVERY_FEE,
      finish: DEFAULT_FINISH,
      orientations: ORIENTATIONS,
      promotion: PROMOTION,
      sizes: FRAME_SIZES.map(withPrices),
    };
  },

  async findSizeById(id) {
    const size = FRAME_SIZES.find((option) => option.id === id);
    return size ? withPrices(size) : null;
  },
};
