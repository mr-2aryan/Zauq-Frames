import { useCallback, useState } from 'react';
import { useCart } from '@/context/cart/useCart';
import { createOrder } from '@/services/ordersApi';

/** API order item for a cart line. Prices are not sent — the server calculates them. */
const toOrderItem = (item) =>
  item.type === 'product'
    ? { type: 'product', productId: item.productId, sizeId: item.sizeId, orientation: item.orientation, quantity: item.quantity }
    : { type: 'custom-frame', photoId: item.photo.id, sizeId: item.sizeId, orientation: item.orientation, quantity: item.quantity, crop: item.crop };

/** Splits API validation details into per-field messages (`customer.name` → `name`) and the rest. */
function splitErrors(details = []) {
  const fieldErrors = {};
  const other = [];
  details.forEach(({ field, message }) => {
    if (field?.startsWith('customer.')) fieldErrors[field.slice('customer.'.length)] = message;
    else other.push(message);
  });
  return { fieldErrors, other };
}

/** Places the cart as an order and clears the cart on success. */
export function useCheckout() {
  const { items, clearCart } = useCart();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [order, setOrder] = useState(null);

  const placeOrder = useCallback(
    async (customer) => {
      setStatus('submitting');
      setError('');
      setFieldErrors({});
      try {
        const placed = await createOrder({ customer, items: items.map(toOrderItem) });
        setOrder(placed);
        setStatus('success');
        clearCart();
      } catch (err) {
        const { fieldErrors: byField, other } = splitErrors(err.details);
        setFieldErrors(byField);
        setError(other[0] ?? (Object.keys(byField).length ? 'Please check the highlighted fields.' : err.message));
        setStatus('error');
      }
    },
    [items, clearCart],
  );

  return { placeOrder, status, error, fieldErrors, order };
}
