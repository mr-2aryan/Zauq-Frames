import { cn } from '@/utils/cn';
import styles from './PrivacyEnvelope.module.css';
import { useLoop } from './useLoop.js';

/** One turn (keep in step with the 10s animations in the CSS). */
const CYCLE_MS = 10000;

/** Where your details go, as the Privacy policy says — and where they never go. */
const ROUTES = [
  { key: 'studio', ok: true, title: 'Our studio', note: 'To make and confirm your order' },
  { key: 'courier', ok: true, title: 'The courier', note: 'Name, phone and address only' },
  { key: 'sold', ok: false, title: 'Anyone else', note: 'Never sold' },
];

/**
 * Privacy: the order form is filled in, folded into an envelope and sealed —
 * then it goes only to our studio and the courier; the route to anyone else
 * is crossed out. Pauses off screen; with reduced motion it shows the result.
 */
export function PrivacyEnvelope() {
  const { ref, cycle, running, still } = useLoop(CYCLE_MS);

  return (
    <div ref={ref} className={cn(styles.scene, !running && styles.paused, still && styles.still)} role="img" aria-label="Your details sealed in an envelope, shared only with our studio and the courier, never sold">
      <div key={cycle} className={styles.cycle} aria-hidden="true">
        {/* The routes from the envelope to each destination. */}
        <svg className={styles.routes} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className={cn(styles.route, styles.routeStudio)} d="M40 52 C 52 52, 52 22, 62 22" />
          <path className={cn(styles.route, styles.routeCourier)} d="M40 52 C 50 52, 52 50, 62 50" />
          <path className={cn(styles.route, styles.routeSold)} d="M40 52 C 50 52, 50 78, 56 78" />
        </svg>

        <div className={styles.envelope}>
          <span className={styles.back} />
          {/* The form, filled in, then slid into the envelope. */}
          <div className={styles.form}>
            <strong>Your order details</strong>
            {['Name', 'Phone', 'Address'].map((field, index) => (
              <span key={field} className={styles.field} style={{ '--i': index }}>
                <small>{field}</small>
                <i />
              </span>
            ))}
          </div>
          <span className={styles.pocket} />
          <span className={styles.flap} />
          <span className={styles.seal}>Z</span>
        </div>

        {ROUTES.map((route, index) => (
          <span key={route.key} className={cn(styles.destination, styles[route.key])} style={{ '--i': index }}>
            <b className={route.ok ? styles.ok : styles.no}>{route.ok ? '✓' : '✗'}</b>
            <span>
              <strong>{route.title}</strong>
              <small>{route.note}</small>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
