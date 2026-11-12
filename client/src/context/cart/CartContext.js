import { createContext } from 'react';

/**
 * Value: `{ items, count, subtotal, addItem, removeItem, setQuantity, clearCart }`.
 * Provided by `CartProvider`; read it with `useCart()`.
 */
export const CartContext = createContext(null);
