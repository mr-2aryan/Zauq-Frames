import { Link } from 'react-router';
import { BagIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { useCart } from '@/context/cart/useCart';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';
import styles from './CartLink.module.css';

/** Header cart button: item count badge and, on wide screens, the running total. */
export function CartLink({ className }) {
  const { items, count, subtotal } = useCart();
  const currency = items[0]?.currency;

  return (
    <Link to={ROUTES.cart} aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`} className={cn(styles.cart, className)}>
      <span className={styles.icon}>
        <BagIcon size={19} />
        {count > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
      <span className={styles.label} aria-hidden="true">
        Cart
      </span>
      {count > 0 && (
        <span className={styles.total} aria-hidden="true">
          {formatPrice(subtotal, currency)}
        </span>
      )}
    </Link>
  );
}
