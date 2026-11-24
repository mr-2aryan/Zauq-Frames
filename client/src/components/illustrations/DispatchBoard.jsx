import { cn } from '@/utils/cn';
import styles from './DispatchBoard.module.css';
import { useLoop } from './useLoop.js';

/** One turn of the board (keep in step with the 3.6s animations in the CSS). */
const CYCLE_MS = 3600;
/** Letters per city on the board. */
const WIDTH = 10;
/** Any city in Pakistan, at the same flat rate — a few of them, in turn. */
const CITIES = ['KARACHI', 'LAHORE', 'ISLAMABAD', 'PESHAWAR', 'QUETTA', 'MULTAN', 'FAISALABAD', 'HYDERABAD', 'SIALKOT', 'GILGIT'];
/** Each row is a stage; cities move up a row each turn (as in the order steps). */
const STAGES = [
  { key: 'shipped', label: 'Shipped' },
  { key: 'packed', label: 'Packed' },
  { key: 'framing', label: 'Framing' },
  { key: 'confirmed', label: 'Confirmed' },
];

const cityAt = (index) => CITIES[((index % CITIES.length) + CITIES.length) % CITIES.length];
const letters = (text) => text.padEnd(WIDTH, ' ').slice(0, WIDTH).split('');

/** One split-flap letter: flips from `from` to `to` (only if they differ). */
function Flap({ from, to, delay }) {
  if (from === to) {
    return (
      <span className={styles.cell}>
        <span className={styles.face}>{to}</span>
      </span>
    );
  }
  return (
    <span className={styles.cell} style={{ '--d': `${delay}ms` }}>
      <span className={cn(styles.face, styles.top)}>{to}</span>
      <span className={cn(styles.face, styles.bottom)}>{from}</span>
      <span className={cn(styles.face, styles.top, styles.flapTop)}>{from}</span>
      <span className={cn(styles.face, styles.bottom, styles.flapBottom)}>{to}</span>
    </span>
  );
}

/**
 * Shipping: a split-flap dispatch board at the Rawalpindi studio. Cities move up
 * a row each turn — confirmed, framing, packed, shipped — the letters flipping
 * over, and every row shows the same flat delivery fee. Below, a packed frame
 * rolls out on the belt, labelled for the city that has just shipped.
 * Pauses off screen; with reduced motion the board is still.
 * @param {{ fee?: string | null, leadTime: string }} props
 */
export function DispatchBoard({ fee, leadTime }) {
  const { ref, cycle, running, still } = useLoop(CYCLE_MS);
  const turn = still ? 0 : cycle;
  const feeText = fee ?? 'Flat fee';

  return (
    <div
      ref={ref}
      className={cn(styles.scene, !running && styles.paused, still && styles.still)}
      role="img"
      aria-label={`A dispatch board: frames leaving our Rawalpindi studio for cities across Pakistan, every one for the same ${feeText} delivery`}
    >
      <div className={styles.board} aria-hidden="true">
        <div className={styles.header}>
          <span className={styles.live}>
            <i /> Dispatch
          </span>
          <span>Rawalpindi studio</span>
        </div>
        <div className={cn(styles.row, styles.headings)}>
          <span>To</span>
          <span>Delivery</span>
          <span>Status</span>
        </div>
        <div key={turn} className={styles.rows}>
          {STAGES.map((stage, row) => {
            const from = letters(turn === 0 ? '' : cityAt(turn - 1 + row));
            const to = letters(cityAt(turn + row));
            return (
              <div key={stage.key} className={styles.row}>
                <span className={styles.city}>
                  {to.map((letter, index) => (
                    <Flap key={index} from={still ? letter : from[index]} to={letter} delay={row * 90 + index * 45} />
                  ))}
                </span>
                <span className={styles.fee}>{feeText}</span>
                <span className={cn(styles.status, styles[stage.key])}>
                  <i />
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
        <p className={styles.footer}>
          Same {feeText} to every city · about {leadTime}, order to door
        </p>
      </div>

      {/* The belt, and the packed frame that has just shipped rolling out on it. */}
      <div className={styles.belt} aria-hidden="true">
        <span className={styles.rollers} />
        <span key={turn} className={styles.parcel}>
          <span className={styles.tape}>ZAUQ</span>
          <span className={styles.tag}>{cityAt(turn)}</span>
        </span>
      </div>
    </div>
  );
}
