import { use } from 'react';
import { CartContext } from './CartContext.js';

/** Access the shopping bag. Must be used inside `<CartProvider>`. */
export function useCart() {
  const context = use(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>.');
  return context;
}
