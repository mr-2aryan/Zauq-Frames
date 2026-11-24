import { cn } from '@/utils/cn';
import styles from './TermsReceipt.module.css';
import { useLoop } from './useLoop.js';

/** One turn: print, stamp, tear off (keep in step with the 12s animations in the CSS). */
const CYCLE_MS = 12000;

/**
 * Terms: a little receipt printer prints the terms of ordering, line by line,
 * as they appear on the page — then a stamp lands and the receipt is torn off
 * for the next one. Pauses off screen; with reduced motion it shows the receipt.
 * @param {{ leadTime: string, deliveryFee?: string | null }} props
 */
export function TermsReceipt({ leadTime, deliveryFee }) {
  const { ref, cycle, running, still } = useLoop(CYCLE_MS);
  const lines = [
    'We confirm every order by call or WhatsApp',
    'Made to order, by hand',
    `At your door in ${leadTime}`,
    deliveryFee ? `Flat ${deliveryFee} delivery per order` : 'One flat delivery fee per order',
    'Pay COD, bank, JazzCash or Easypaisa',
    'Damaged or wrong? We put it right',
    'Custom frames: no change-of-mind returns',
  ];

  return (
    <div ref={ref} className={cn(styles.scene, !running && styles.paused, still && styles.still)} role="img" aria-label="A receipt printing the terms of ordering from Zauq Frames">
      <div className={styles.printer} aria-hidden="true">
        <span className={styles.brand}>ZAUQ</span>
        <span className={styles.light} />
        <span className={styles.slot} />
      </div>

      {/* The paper comes out of the slot, line by line. */}
      <div className={styles.window} aria-hidden="true">
        <div key={cycle} className={styles.paper}>
          <p className={styles.logo}>
            <strong>ZAUQ</strong>
            <span>PREMIUM FRAMES</span>
          </p>
          <p className={styles.heading}>Order terms · plain &amp; simple</p>
          <hr />
          <ol className={styles.lines}>
            {lines.map((line, index) => (
              <li key={line} style={{ '--i': index }}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <span>{line}</span>
              </li>
            ))}
          </ol>
          <hr />
          <p className={styles.thanks}>Thank you for choosing Zauq</p>
          <span className={styles.barcode} />
          <span className={styles.stamp}>
            <span>Clear</span>
            <span>&amp; fair</span>
          </span>
        </div>
      </div>
    </div>
  );
}
