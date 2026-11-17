import { formatPrice } from '@/utils/formatPrice';
import styles from './OrderSummary.module.css';

/**
 * Checkout-style order summary: each line with its thumbnail and a quantity
 * bubble, then subtotal, discount, delivery and the total.
 * @param {{
 *   lines: Array<{ key: string, image?: string, crop?: { x: number, y: number }, name: string, meta: string, quantity: number, price: number }>,
 *   subtotal: number,
 *   savings?: number,
 *   savingsLabel?: string,
 *   delivery: number,
 *   total: number,
 *   currency: string,
 * }} props
 */
export function OrderSummary({ lines, subtotal, savings = 0, savingsLabel = 'Discount', delivery, total, currency }) {
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className={styles.summary}>
      <ul className={styles.lines}>
        {lines.map((line) => (
          <li key={line.key} className={styles.line}>
            <span className={styles.thumb}>
              {line.image && <img src={line.image} alt="" style={line.crop ? { objectPosition: `${line.crop.x}% ${line.crop.y}%` } : undefined} />}
              <span className={styles.qty}>
                <span className="sr-only">Quantity </span>
                {line.quantity}
              </span>
            </span>
            <span className={styles.text}>
              <span className={styles.name}>{line.name}</span>
              <span className={styles.meta}>{line.meta}</span>
            </span>
            <span className={styles.price}>{formatPrice(line.price, currency)}</span>
          </li>
        ))}
      </ul>

      <dl className={styles.totals}>
        <div>
          <dt>
            Subtotal · {count} {count === 1 ? 'item' : 'items'}
          </dt>
          <dd>{formatPrice(subtotal, currency)}</dd>
        </div>
        {savings > 0 && (
          <div className={styles.saving}>
            <dt>{savingsLabel}</dt>
            <dd>−{formatPrice(savings, currency)}</dd>
          </div>
        )}
        <div>
          <dt>Shipping</dt>
          <dd>{formatPrice(delivery, currency)}</dd>
        </div>
        <div className={styles.total}>
          <dt>Total</dt>
          <dd>
            <small>{currency}</small>
            {formatPrice(total, currency)}
          </dd>
        </div>
      </dl>
      {savings > 0 && (
        <p className={styles.saved}>
          Total savings <strong>{formatPrice(savings, currency)}</strong>
        </p>
      )}
    </div>
  );
}
