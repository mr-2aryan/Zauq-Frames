import { useCallback, useState } from 'react';
import { useCart } from '@/context/cart/useCart';
import { createOrder } from '@/services/ordersApi';
import { saveLastOrder } from '../lastOrder.js';

/** API order item for a cart line. Prices are not sent — the server calculates them. */
const toOrderItem = (item) =>
  item.type === 'product'
    ? { type: 'product', productId: item.productId, sizeId: item.sizeId, orientation: item.orientation, mat: item.mat ?? 'none', quantity: item.quantity }
    : {
        type: 'custom-frame',
        photoId: item.photo.id,
        sizeId: item.sizeId,
        orientation: item.orientation,
        mat: item.mat ?? 'none',
        quantity: item.quantity,
        crop: item.crop,
      };

/** Splits API validation details into per-field messages (`customer.name` → `name`) and the rest. */
function splitErrors(details = []) {
  const fieldErrors = {};
  const other = [];
  (Array.isArray(details) ? details : []).forEach(({ field, message }) => {
    if (field?.startsWith('customer.')) fieldErrors[field.slice('customer.'.length)] = message;
    else other.push(message);
  });
  return { fieldErrors, other };
}

/**
 * Places the cart as an order. On success the cart is cleared, the order is
 * remembered for the confirmation page, and the placed order is returned.
 */
export function useCheckout() {
  const { items, clearCart } = useCart();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const placeOrder = useCallback(
    async ({ customer, paymentMethod }) => {
      setStatus('submitting');
      setError('');
      setFieldErrors({});
      try {
        const placed = await createOrder({ customer, paymentMethod, items: items.map(toOrderItem) });
        saveLastOrder(placed, customer);
        setStatus('success');
        clearCart();
        return placed;
      } catch (err) {
        const { fieldErrors: byField, other } = splitErrors(err.details);
        setFieldErrors(byField);
        setError(other[0] ?? (Object.keys(byField).length ? 'Please check the highlighted fields.' : err.message));
        setStatus('error');
        return null;
      }
    },
    [items, clearCart],
  );

  return { placeOrder, status, error, fieldErrors };
}
