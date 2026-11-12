/**
 * Frame catalogue — the single source of truth for sizes and prices.
 * Dimensions are in inches, prices in PKR. This moves into the database
 * once one is chosen; only `frames.service.js` reads it directly.
 */

export const CURRENCY = 'PKR';
export const DELIVERY_FEE = 200;
export const DEFAULT_FINISH = 'black';
export const ORIENTATIONS = Object.freeze(['portrait', 'landscape']);

/**
 * Site-wide promotion, applied to every frame (collection pieces and custom
 * frames) both on the website and in order totals. Set `percentOff` to 0 to
 * switch it off.
 */
export const PROMOTION = Object.freeze({ percentOff: 15, label: '15% off every frame' });

/**
 * What customers pay for every collection piece (the shop's products), in any
 * size, after the promotion. The struck-through list price is worked out from
 * it (2500 at 15% off shows as "Rs 2,941"). Custom frames are priced by size
 * instead (FRAME_SIZES below).
 */
export const PRODUCT_PRICE = 2500;

/** Sizes offered for every frame. `price` is the custom-frame price for that size. */
export const FRAME_SIZES = Object.freeze(
  [
    { id: '8x10', width: 8, height: 10, price: 1500, description: 'Desks, shelves, bedside walls and small spaces.' },
    { id: '12x16', width: 12, height: 16, price: 2000, description: 'Bedrooms, workspaces and gallery walls.' },
    { id: '16x20', width: 16, height: 20, price: 2200, description: 'Balanced and versatile for modern interiors.' },
    { id: '18x24', width: 18, height: 24, price: 2500, description: 'The premium statement size for feature walls.' },
    { id: '24x36', width: 24, height: 36, price: 4000, description: 'Bold artwork and spacious walls.' },
  ].map((size) => Object.freeze(size)),
);
