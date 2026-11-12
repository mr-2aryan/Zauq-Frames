import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';
import styles from './Price.module.css';

/**
 * Sale price with the original price struck through when they differ.
 * @param {{ amount: number, listAmount?: number, currency?: string, from?: boolean, size?: 'sm' | 'md' | 'lg', showSaving?: boolean, className?: string }} props
 */
export function Price({ amount, listAmount, currency = 'PKR', from = false, size = 'md', showSaving = false, className }) {
  const discounted = listAmount && listAmount > amount;
  const percentOff = discounted ? Math.round(((listAmount - amount) / listAmount) * 100) : 0;

  return (
    <span className={cn(styles.price, styles[size], className)}>
      {from && <span className={styles.from}>From</span>}
      <strong className={styles.amount}>{formatPrice(amount, currency)}</strong>
      {discounted && (
        <>
          <s className={styles.list}>
            <span className="sr-only">was </span>
            {formatPrice(listAmount, currency)}
          </s>
          {showSaving && <span className={styles.saving}>−{percentOff}%</span>}
        </>
      )}
    </span>
  );
}
