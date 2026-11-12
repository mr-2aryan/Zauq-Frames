import { formatPrice } from '@/utils/formatPrice';
import styles from './CartSummary.module.css';

/**
 * Subtotal, savings, delivery and total.
 * @param {{ subtotal: number, savings: number, deliveryFee: number | null, currency: string, count: number }} props
 */
export function CartSummary({ subtotal, savings, deliveryFee, currency, count }) {
  const total = subtotal + (deliveryFee ?? 0);

  return (
    <dl className={styles.list}>
      <div className={styles.row}>
        <dt>
          Subtotal · {count} {count === 1 ? 'item' : 'items'}
        </dt>
        <dd>{formatPrice(subtotal, currency)}</dd>
      </div>
      {savings > 0 && (
        <div className={`${styles.row} ${styles.savings}`}>
          <dt>You save</dt>
          <dd>−{formatPrice(savings, currency)}</dd>
        </div>
      )}
      <div className={styles.row}>
        <dt>Delivery · anywhere in Pakistan</dt>
        <dd>{deliveryFee === null ? '—' : formatPrice(deliveryFee, currency)}</dd>
      </div>
      <div className={`${styles.row} ${styles.total}`}>
        <dt>Total</dt>
        <dd>{formatPrice(total, currency)}</dd>
      </div>
    </dl>
  );
}
