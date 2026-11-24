import { cn } from '@/utils/cn';
import styles from './RepairLoop.module.css';
import { useLoop } from './useLoop.js';

/** One turn of the loop (keep in step with the 10s animations in the CSS). */
const CYCLE_MS = 10000;
const ART = '/images/art/eminem.jpg';
/** The three steps, evenly round the track (Tell us at the top, then clockwise). */
const STATIONS = [
  { key: 'tell', number: 1, label: 'Tell us' },
  { key: 'photos', number: 2, label: 'Send photos' },
  { key: 'fix', number: 3, label: 'We put it right' },
];

/**
 * Returns: a frame arrives damaged — its top-right corner split open and the
 * print's corner folded over, circled so it's plain to see. A marker goes round
 * the three steps (tell us, send photos, we put it right), filling the track as
 * it goes; as it reaches the last, the corner closes, the print lies flat, the
 * frame straightens and the warning turns to a tick.
 * Pauses off screen; with reduced motion it shows the frame put right.
 */
export function RepairLoop() {
  const { ref, cycle, running, still } = useLoop(CYCLE_MS);

  return (
    <div ref={ref} className={cn(styles.scene, !running && styles.paused, still && styles.still)} role="img" aria-label="A damaged frame put right in three steps: tell us, send photos, we put it right">
      {/* The track round the three steps, filling as the marker travels it. */}
      <svg className={styles.track} viewBox="0 0 100 100" aria-hidden="true">
        <circle className={styles.rail} cx="50" cy="52" r="38" />
        <circle key={cycle} className={styles.progress} cx="50" cy="52" r="38" pathLength="100" transform="rotate(150 50 52)" />
      </svg>

      <div key={cycle} className={styles.loop} aria-hidden="true">
        {/* The frame: crooked, a corner split — until it's put right. */}
        <div className={styles.frame}>
          <span className={styles.backing} />
          <img src={ART} alt="" className={styles.art} />
          {/* The print's corner, folded over. */}
          <span className={styles.flapShadow}>
            <span className={styles.flap} />
          </span>
          <svg className={styles.moulding} viewBox="0 0 200 250" preserveAspectRatio="none">
            <path d="M0 0 L16 16 L16 234 L0 250 Z" />
            <path d="M0 250 L16 234 L184 234 L200 250 Z" />
            {/* The two rails at the split corner, each with its bare, broken end. */}
            <g className={styles.barTop}>
              <path d="M0 0 L200 0 L184 16 L16 16 Z" />
              <path className={styles.raw} d="M199 1 L185 15" />
            </g>
            <g className={styles.barRight}>
              <path d="M200 0 L200 250 L184 234 L184 16 Z" />
              <path className={styles.raw} d="M199 1 L185 15" />
            </g>
          </svg>
          <span className={styles.flash} />
          {/* Circled: here's the damage. */}
          <span className={styles.ring} />
          <span className={styles.badge}>
            <span className={styles.badgeWarn}>!</span>
            <span className={styles.badgeOk}>✓</span>
          </span>
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className={styles.sparkle} style={{ '--i': index }} />
          ))}
        </div>

        {/* "It arrived with a split corner": the customer's message. */}
        <span className={styles.bubble}>It arrived with a split corner</span>

        {/* Photos, sent. */}
        {[0, 1].map((index) => (
          <span key={index} className={styles.snap} style={{ '--i': index }}>
            <img src={ART} alt="" />
          </span>
        ))}

        <span className={styles.marker} />

        {STATIONS.map((station) => (
          <span key={station.key} className={cn(styles.station, styles[station.key])}>
            <b>{station.number}</b>
            {station.label}
          </span>
        ))}
      </div>
    </div>
  );
}
