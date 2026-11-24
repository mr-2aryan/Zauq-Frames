import { cn } from '@/utils/cn';
import styles from './CareWipe.module.css';
import { useLoop } from './useLoop.js';

/** One turn (keep in step with the 9s animations in the CSS). */
const CYCLE_MS = 9000;
/** A Heritage Pakistan piece (landscape). */
const ART = '/images/art/badshahi-mosque.jpg';

/** The habits, from the Care guide: do (✓) or don't (✗). */
const HABITS = [
  { key: 'dry', ok: true, label: 'Soft, dry cloth' },
  { key: 'spray', ok: false, label: 'No sprays' },
  { key: 'sun', ok: false, label: 'Strong sun' },
  { key: 'hang', ok: true, label: 'Hang securely' },
];

/**
 * Care guide: a dusty frame on the wall, wiped clean by a soft cloth in a few
 * light strokes; a shine runs across it, and the habits that keep it that way
 * pop up around it. Pauses off screen; with reduced motion it shows the frame
 * clean with its habits.
 */
export function CareWipe() {
  const { ref, cycle, running, still } = useLoop(CYCLE_MS);

  return (
    <div ref={ref} className={cn(styles.scene, !running && styles.paused, still && styles.still)} role="img" aria-label="A frame wiped clean with a soft, dry cloth, and the habits that keep it looking new">
      <div key={cycle} className={styles.cycle} aria-hidden="true">
        <div className={styles.frame}>
          <img src={ART} alt="" className={styles.art} />
          {/* Dust: wiped away from left to right as the cloth passes. */}
          <span className={styles.dust} />
          <span className={styles.shine} />
        </div>

        {/* The cloth: a soft microfibre square, folded over at one corner, with a
            stitched hem — moving in light strokes. */}
        <svg className={styles.cloth} viewBox="0 0 120 100">
          <path d="M12 24 Q 12 12 26 11 L 96 9 Q 110 9 110 22 L 112 76 Q 112 89 98 89 L 24 91 Q 9 91 9 77 Z" fill="#cdd6ab" />
          <path d="M19 22 Q 19 18 24 18 L 97 16 Q 103 16 103 22 L 105 76 Q 105 82 99 82 L 23 84 Q 17 84 17 78 Z" fill="none" stroke="#a5b27c" strokeWidth="1.6" strokeDasharray="4 3" />
          <path d="M30 40 Q 60 34 96 44 M24 62 Q 58 56 100 66" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinecap="round" />
          <path d="M12 24 Q 12 12 26 11 L 66 10 Q 44 34 12 58 Z" fill="#b6c290" />
          <path d="M66 10 Q 44 34 12 58" fill="none" stroke="#97a46d" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <span key={index} className={styles.mote} style={{ '--i': index, '--row': index % 3 }} />
        ))}

        {HABITS.map((habit, index) => (
          <span key={habit.key} className={cn(styles.habit, styles[habit.key])} style={{ '--i': index }}>
            <b className={habit.ok ? styles.ok : styles.no}>{habit.ok ? '✓' : '✗'}</b>
            {habit.label}
          </span>
        ))}
      </div>
    </div>
  );
}
