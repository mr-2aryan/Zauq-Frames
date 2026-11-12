import { Badge, Button, Price } from '@/components/ui';
import styles from './OrderSummary.module.css';

/**
 * Price and "Add to cart" for the configured custom frame.
 * @param {{ size: import('@/services/framesApi').FrameSize, currency: string, finish: string, percentOff: number, isSubmitting: boolean, error?: string, onAddToCart: () => void }} props
 */
export function OrderSummary({ size, currency, finish, percentOff, isSubmitting, error, onAddToCart }) {
  return (
    <>
      <div className={styles.box}>
        <Price amount={size.salePrice} listAmount={size.price} currency={currency} size="lg" />
        {percentOff > 0 && <Badge tone="sale">Save {percentOff}%</Badge>}
        <span className={styles.meta}>Includes a {finish} frame · ready to hang</span>
      </div>
      <Button size="lg" block onClick={onAddToCart} disabled={isSubmitting} aria-busy={isSubmitting} className={styles.button}>
        {isSubmitting ? 'Uploading photo…' : 'Add to cart'}
      </Button>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </>
  );
}
