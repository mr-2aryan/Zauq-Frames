import { ORDER_STEPS } from '@/features/orders';
import { cn } from '@/utils/cn';
import styles from './AccountPeek.module.css';
import { useLoop } from './useLoop.js';

/** One step of the order every 1.5s (keep in step with the CSS). */
const STEP_MS = 1500;

/**
 * Account: what an account gives you, peeking out from behind the sign-in card —
 * an order moving through its steps (placed, confirmed, printing & framing,
 * shipped, delivered) along the top, and your details saved for checkout along
 * the bottom. Wraps the card (`children`); purely decorative, and hidden on
 * small screens. Pauses off screen; with reduced motion it shows the order delivered.
 */
export function AccountPeek({ children }) {
  const { ref, cycle, running, still } = useLoop(STEP_MS);
  const step = still ? ORDER_STEPS.length - 1 : cycle % (ORDER_STEPS.length + 1);
  const current = ORDER_STEPS[Math.min(step, ORDER_STEPS.length - 1)];

  return (
    <div ref={ref} className={cn(styles.stage, !running && styles.paused, still && styles.still)}>
      <div className={cn(styles.peek, styles.order)} aria-hidden="true">
        <img src="/images/art/clock-tower.jpg" alt="" />
        <span className={styles.orderText}>
          <small>Order ZQ-4F9A1C7B2E</small>
          <strong key={current.status} className={styles.status}>
            {current.label}
          </strong>
        </span>
        <span className={styles.steps}>
          {ORDER_STEPS.map((orderStep, index) => (
            <i key={orderStep.status} className={cn(index <= step && styles.done)} />
          ))}
        </span>
      </div>

      <div className={cn(styles.peek, styles.saved)} aria-hidden="true">
        <strong>Saved for checkout</strong>
        <span className={styles.chips}>
          <span className={styles.chip} style={{ '--i': 0 }}>
            <b>✓</b> Address
          </span>
          <span className={styles.chip} style={{ '--i': 1 }}>
            <b>✓</b> Phone
          </span>
        </span>
      </div>

      <div className={styles.card}>{children}</div>
    </div>
  );
}
