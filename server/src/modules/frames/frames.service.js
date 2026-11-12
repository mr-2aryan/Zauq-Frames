import { CURRENCY, DEFAULT_FINISH, DELIVERY_FEE, FRAME_SIZES, ORIENTATIONS, PRODUCT_PRICE, PROMOTION } from './frames.catalog.js';

/** Price after the site-wide promotion, rounded to whole rupees. */
export const applyPromotion = (price) => Math.round((price * (100 - PROMOTION.percentOff)) / 100);

/** List price that the promotion brings down to `salePrice`. */
const listPriceFor = (salePrice) => Math.round((salePrice * 100) / (100 - PROMOTION.percentOff));

const withSalePrice = (size) => ({ ...size, salePrice: applyPromotion(size.price) });

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
      // Collection pieces: one price for every size, set as the price after the promotion.
      productPrice: { price: listPriceFor(PRODUCT_PRICE), salePrice: PRODUCT_PRICE },
      sizes: FRAME_SIZES.map(withSalePrice),
    };
  },

  async findSizeById(id) {
    const size = FRAME_SIZES.find((option) => option.id === id);
    return size ? withSalePrice(size) : null;
  },
};
