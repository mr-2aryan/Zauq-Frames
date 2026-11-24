import { cn } from '@/utils/cn';
import styles from './FrameLayers.module.css';
import { useLoop } from './useLoop.js';

/** One turn: apart, together, apart again (keep in step with the 9s animations in the CSS). */
const CYCLE_MS = 9000;
const ART = '/images/art/colour-town.jpg';

/** What each layer is — only what the Craftsmanship page itself says. */
const LAYERS = [
  { key: 'frame', title: 'Black frame', note: 'Set by hand, square at every corner' },
  { key: 'mat', title: 'White mat', note: 'If you’d like one, free' },
  { key: 'print', title: 'High-quality print', note: 'Rich colour, crisp detail' },
  { key: 'back', title: 'Backing', note: 'Hanging hooks fitted' },
];

/**
 * Craftsmanship: a frame taken apart into its layers — backing with its hooks,
 * the print, the mat and the black frame — floating apart with their names,
 * then coming together by hand into one finished piece, and apart again.
 * Pauses off screen; with reduced motion it shows the layers apart, named.
 */
export function FrameLayers() {
  const { ref, cycle, running, still } = useLoop(CYCLE_MS);

  return (
    <div
      ref={ref}
      className={cn(styles.scene, !running && styles.paused, still && styles.still)}
      role="img"
      aria-label="A frame shown in layers: black frame, white mat, print and backing with hooks, coming together into one piece"
    >
      <span className={styles.floorShadow} aria-hidden="true" />
      <div key={cycle} className={styles.cycle} aria-hidden="true">
        <div className={styles.stack}>
          <div className={cn(styles.layer, styles.back)}>
            <span className={cn(styles.hook, styles.hookLeft)} />
            <span className={cn(styles.hook, styles.hookRight)} />
            <span className={styles.sticker}>ZAUQ</span>
          </div>
          <div className={cn(styles.layer, styles.print)}>
            <img src={ART} alt="" />
          </div>
          <div className={cn(styles.layer, styles.mat)} />
          <div className={cn(styles.layer, styles.frame)} />
        </div>

        <ol className={styles.labels}>
          {LAYERS.map((layer) => (
            <li key={layer.key} className={styles[`label_${layer.key}`]}>
              <strong>{layer.title}</strong>
              <span>{layer.note}</span>
            </li>
          ))}
        </ol>

        <span className={styles.done}>✓ Assembled by hand in Rawalpindi</span>
      </div>
    </div>
  );
}
