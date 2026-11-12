/**
 * @typedef {{
 *   id: string,
 *   type: 'product' | 'custom-frame',
 *   name: string,
 *   image: string,
 *   sizeId: string,
 *   sizeLabel: string,
 *   orientation: 'portrait' | 'landscape',
 *   unitPrice: number,
 *   listPrice: number,
 *   currency: string,
 *   quantity: number,
 *   productId?: string,
 *   photo?: { id: string, url: string, name: string },
 *   crop?: { x: number, y: number },
 * }} CartItem
 *
 * @typedef {{ items: CartItem[] }} CartState
 */

export const CART_ACTIONS = Object.freeze({
  ADD: 'cart/add',
  REMOVE: 'cart/remove',
  SET_QUANTITY: 'cart/setQuantity',
  CLEAR: 'cart/clear',
});

export const MAX_QUANTITY = 20;

/** @type {CartState} */
export const initialCartState = { items: [] };

/** Items are the same line only if the piece (or photo and crop), size and orientation all match. */
const lineKey = (item) =>
  [item.type, item.productId ?? item.photo?.id, item.sizeId, item.orientation, item.crop?.x, item.crop?.y].join('|');

const clampQuantity = (quantity) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(quantity) || 1));

/**
 * @param {CartState} state
 * @param {{ type: string, [key: string]: any }} action
 * @returns {CartState}
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD: {
      const key = lineKey(action.item);
      const existing = state.items.find((item) => lineKey(item) === key);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item === existing ? { ...item, quantity: clampQuantity(item.quantity + action.item.quantity) } : item,
          ),
        };
      }
      return { items: [...state.items, { ...action.item, quantity: clampQuantity(action.item.quantity) }] };
    }

    case CART_ACTIONS.REMOVE:
      return { items: state.items.filter((item) => item.id !== action.id) };

    case CART_ACTIONS.SET_QUANTITY:
      return {
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity: clampQuantity(action.quantity) } : item,
        ),
      };

    case CART_ACTIONS.CLEAR:
      return initialCartState;

    default:
      return state;
  }
}
