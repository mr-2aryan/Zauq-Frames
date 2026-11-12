import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { CartContext } from './CartContext.js';
import { CART_ACTIONS, cartReducer, initialCartState } from './cartReducer.js';

// v2: items carry `type`, `name`, `image`, `sizeLabel` and sale prices.
// v3: collection pieces have one price for every size.
const STORAGE_KEY = 'zauq:cart:v3';

/** Restores the cart from localStorage; falls back to empty on any problem. */
function loadCart() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    return Array.isArray(saved?.items) ? { items: saved.items } : initialCartState;
  } catch {
    return initialCartState;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked (private mode) — the cart still works for this session.
    }
  }, [state]);

  const addItem = useCallback(
    (item) => dispatch({ type: CART_ACTIONS.ADD, item: { id: crypto.randomUUID(), quantity: 1, ...item } }),
    [],
  );
  const removeItem = useCallback((id) => dispatch({ type: CART_ACTIONS.REMOVE, id }), []);
  const setQuantity = useCallback((id, quantity) => dispatch({ type: CART_ACTIONS.SET_QUANTITY, id, quantity }), []);
  const clearCart = useCallback(() => dispatch({ type: CART_ACTIONS.CLEAR }), []);

  const value = useMemo(() => {
    const count = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const listTotal = state.items.reduce((sum, item) => sum + (item.listPrice ?? item.unitPrice) * item.quantity, 0);
    return { items: state.items, count, subtotal, savings: listTotal - subtotal, addItem, removeItem, setQuantity, clearCart };
  }, [state.items, addItem, removeItem, setQuantity, clearCart]);

  return <CartContext value={value}>{children}</CartContext>;
}
