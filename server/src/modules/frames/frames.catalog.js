/**
 * Frame options. ORIENTATIONS and MATS are fixed (orders are validated against
 * them). The sizes, prices, delivery fee and promotion below are the starting
 * values only: they are copied into the database on the first start
 * (settings key 'frames', see db/seed.js) and edited in the admin after that.
 * Dimensions are in inches, prices in PKR.
 */

export const CURRENCY = 'PKR';
export const DELIVERY_FEE = 200;
export const DEFAULT_FINISH = 'black';
export const ORIENTATIONS = Object.freeze(['portrait', 'landscape']);
/** A white mat (border between the frame and the picture) on request, at no extra cost. 'none' = edge to edge. */
export const MATS = Object.freeze(['none', 'white']);

/**
 * Site-wide promotion, applied to every frame (collection pieces and custom
 * frames) both on the website and in order totals. Set `percentOff` to 0 to
 * switch it off.
 */
export const PROMOTION = Object.freeze({ percentOff: 15, label: '15% off every frame' });

/**
 * Sizes offered for every frame — collection pieces and custom frames alike.
 * `salePrice` is what customers pay, after the promotion; the struck-through
 * list price is worked out from it (Rs 2,500 at 15% off shows as Rs 2,941).
 */
export const FRAME_SIZES = Object.freeze(
  [
    { id: '8x10', width: 8, height: 10, salePrice: 1500, description: 'Desks, shelves, bedside walls and small spaces.' },
    { id: '12x16', width: 12, height: 16, salePrice: 2000, description: 'Bedrooms, workspaces and gallery walls.' },
    { id: '16x20', width: 16, height: 20, salePrice: 2200, description: 'Balanced and versatile for modern interiors.' },
    { id: '18x24', width: 18, height: 24, salePrice: 2500, description: 'The premium statement size for feature walls.' },
    { id: '24x36', width: 24, height: 36, salePrice: 4000, description: 'Bold artwork and spacious walls.' },
    { id: '36x48', width: 36, height: 48, salePrice: 8500, description: 'Our largest: a true centrepiece for big walls and open living spaces.' },
  ].map((size) => Object.freeze(size)),
);
