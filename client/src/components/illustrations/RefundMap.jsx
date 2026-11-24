import { cn } from '@/utils/cn';
import styles from './RefundMap.module.css';
import { useLoop } from './useLoop.js';

/** One train journey (keep in step with the 8s animations below and in the CSS). */
const CYCLE_MS = 8000;
const SECONDS = CYCLE_MS / 1000;
/** The train waits at "It arrives", runs (eased), then rests at its end of the line. */
const KEY_TIMES = '0;0.06;0.86;1';
const KEY_SPLINES = '0 0 1 1;0.45 0 0.25 1;0 0 1 1';
const RUN = { start: 0.06, end: 0.86, ease: [0.45, 0, 0.25, 1] };

/** The main line, as segments (M, L, Q) — each one ends at a stop or a bend. */
const MAIN = [
  ['M', 52, 118],
  ['L', 170, 118],
  ['L', 288, 118],
  ['Q', 318, 118, 330, 148],
  ['L', 352, 196],
];
/** The two branches from "We agree the fix": put right, or a payment returned. */
const BRANCHES = {
  fixed: [
    ['Q', 366, 226, 396, 160],
    ['Q', 410, 128, 448, 128],
  ],
  refund: [
    ['Q', 366, 226, 396, 268],
    ['Q', 414, 292, 448, 292],
  ],
};

/** Stations, as the Refund policy describes them; `stop` is the segment they end. */
const STATIONS = [
  { x: 52, y: 118, stop: 0, label: 'It arrives', sub: 'Damaged or wrong?', anchor: 'middle', dy: -40 },
  { x: 170, y: 118, stop: 1, label: 'Message us', sub: 'On WhatsApp', anchor: 'middle', dy: -40 },
  { x: 288, y: 118, stop: 2, label: 'Send photos', sub: 'Frame, print, box', anchor: 'middle', dy: -40 },
  { x: 352, y: 196, stop: 4, label: 'We agree the fix', sub: 'With you, on WhatsApp', anchor: 'end', dx: -22, dy: 4, interchange: true },
];

const toPath = (segments) => segments.map(([command, ...points]) => `${command} ${points.join(' ')}`).join(' ');

function segmentLength(from, [command, ...p]) {
  if (command === 'L') return Math.hypot(p[0] - from[0], p[1] - from[1]);
  let length = 0;
  let previous = from;
  for (let i = 1; i <= 24; i += 1) {
    const t = i / 24;
    const point = [(1 - t) ** 2 * from[0] + 2 * (1 - t) * t * p[0] + t * t * p[2], (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * p[1] + t * t * p[3]];
    length += Math.hypot(point[0] - previous[0], point[1] - previous[1]);
    previous = point;
  }
  return length;
}

const bezier = (p1, p2, s) => 3 * (1 - s) ** 2 * s * p1 + 3 * (1 - s) * s * s * p2 + s ** 3;

/** When (in seconds) the train is this far (0 → 1) along its route. */
function secondsAt(fraction) {
  const [x1, y1, x2, y2] = RUN.ease;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 30; i += 1) {
    const mid = (low + high) / 2;
    if (bezier(y1, y2, mid) < fraction) low = mid;
    else high = mid;
  }
  return (RUN.start + (RUN.end - RUN.start) * bezier(x1, x2, (low + high) / 2)) * SECONDS;
}

/** Each journey: its path, and when the train reaches each stop. */
const ROUTES = Object.fromEntries(
  Object.entries(BRANCHES).map(([key, branch]) => {
    const segments = [...MAIN, ...branch];
    let at = segments[0].slice(1);
    let total = 0;
    const ends = [0];
    segments.slice(1).forEach((segment) => {
      total += segmentLength(at, segment);
      ends.push(total);
      at = segment.slice(-2);
    });
    return [key, { key, d: toPath(segments), at: ends.map((distance) => (distance === 0 ? 0 : secondsAt(distance / total))) }];
  }),
);
const END_AT = RUN.end * SECONDS;

/**
 * Refund policy as a metro map, drawn straight onto the hero: the lines draw
 * themselves in, then a little train runs from "It arrives" through the steps,
 * lighting each station and the track behind it, and takes one branch — put
 * right, or a payment returned (each journey alternates) — where its stop pops
 * with a tick or "Rs". A grey spur shows that custom frames aren't returnable
 * for a change of mind. With reduced motion the map is still.
 */
export function RefundMap() {
  const { ref, cycle, running, still } = useLoop(CYCLE_MS);
  const route = cycle % 2 === 0 ? ROUTES.fixed : ROUTES.refund;
  const mainPath = toPath(MAIN);

  return (
    <div
      ref={ref}
      className={cn(styles.scene, !running && styles.paused, still && styles.still)}
      role="img"
      aria-label="The refund policy as a map: it arrives, message us, send photos, we agree the fix, then it's put right or a payment is returned"
    >
      <svg viewBox="0 0 520 420" className={styles.map} aria-hidden="true">
        {/* A faint street map behind the lines. */}
        <g className={styles.streets}>
          <path className={styles.river} d="M 520 40 C 430 70 470 170 380 200 S 230 250 200 330 S 90 400 0 392" />
          <path className={styles.park} d="M 150 170 q 40 -22 78 0 q 24 30 -6 54 q -40 18 -70 -6 q -22 -24 -2 -48 z" />
          <path className={styles.park} d="M 400 340 q 30 -16 62 2 q 16 24 -6 40 q -34 12 -56 -6 q -14 -20 0 -36 z" />
          <path className={styles.grid} d="M 0 60 H 520 M 0 250 H 520 M 110 0 V 420 M 230 0 V 420 M 420 0 V 420" />
        </g>

        {/* Custom frames: no change-of-mind returns (a dead-end spur). */}
        <path className={cn(styles.spur, styles.fadeIn)} d="M 52 118 V 300" />
        <g className={cn(styles.terminus, styles.fadeIn)} transform="translate(52 318)">
          <circle r="13" />
          <path d="M -5 -5 L 5 5 M 5 -5 L -5 5" />
        </g>
        <text className={styles.label} x="76" y="306">
          Change of mind
        </text>
        <text className={styles.sub} x="76" y="324">
          Custom frames aren’t returnable
        </text>

        {/* The lines, drawing themselves in. */}
        <path className={cn(styles.lineMain, styles.draw)} d={mainPath} pathLength="1" />
        <path className={cn(styles.lineMain, styles.draw, styles.drawLate)} d={`M 352 196 ${toPath(BRANCHES.fixed)}`} pathLength="1" />
        <path className={cn(styles.linePay, styles.draw, styles.drawLate)} d={`M 352 196 ${toPath(BRANCHES.refund)}`} pathLength="1" />

        {/* Stations. */}
        {STATIONS.map((station, index) => (
          <g key={station.label}>
            <circle className={cn(styles.station, station.interchange && styles.interchange, styles.pop)} style={{ '--i': index }} cx={station.x} cy={station.y} r={station.interchange ? 14 : 10} />
            <text className={styles.label} x={station.x + (station.dx ?? 0)} y={station.y + station.dy} textAnchor={station.anchor}>
              {station.label}
            </text>
            <text className={styles.sub} x={station.x + (station.dx ?? 0)} y={station.y + station.dy + 16} textAnchor={station.anchor}>
              {station.sub}
            </text>
          </g>
        ))}
        <circle className={cn(styles.end, styles.pop)} style={{ '--i': 4 }} cx="448" cy="128" r="14" />
        <text className={styles.sub} x="448" y="78" textAnchor="middle">
          Fixed or replaced
        </text>
        <text className={styles.label} x="448" y="96" textAnchor="middle">
          Put right
        </text>
        <circle className={cn(styles.end, styles.endPay, styles.pop)} style={{ '--i': 5 }} cx="448" cy="292" r="14" />
        <text className={styles.label} x="448" y="330" textAnchor="middle">
          Payment returned
        </text>
        <text className={styles.sub} x="448" y="346" textAnchor="middle">
          Arranged with you
        </text>

        {/* Legend. */}
        <g transform="translate(40 392)">
          <path className={styles.legendMain} d="M 0 0 H 26" />
          <text className={styles.sub} x="34" y="4">
            Putting it right
          </text>
          <path className={styles.legendPay} d="M 160 0 H 186" />
          <text className={styles.sub} x="194" y="4">
            If money is returned
          </text>
          <path className={styles.legendSpur} d="M 340 0 H 366" />
          <text className={styles.sub} x="374" y="4">
            No return
          </text>
        </g>
      </svg>

      {/* The journey: its own drawing, made afresh each time so its animations start at 0. */}
      {!still && (
        <svg key={cycle} viewBox="0 0 520 420" className={styles.journey} aria-hidden="true">
          {/* The track behind the train, lit. */}
          <path className={styles.trail} d={route.d} pathLength="1" strokeDashoffset="1">
            <animate attributeName="stroke-dashoffset" dur={`${SECONDS}s`} fill="freeze" values="1;1;0;0" keyTimes={KEY_TIMES} calcMode="spline" keySplines={KEY_SPLINES} />
          </path>

          {/* Each station lights up as the train reaches it. */}
          {STATIONS.map((station) => (
            <g key={station.label} transform={`translate(${station.x} ${station.y})`}>
              <circle className={styles.lit} style={{ '--at': `${route.at[station.stop]}s` }} r={station.interchange ? 7 : 5} />
            </g>
          ))}

          {/* Its stop at the end of the line: a ripple, then a tick or "Rs". */}
          <g transform={`translate(448 ${route.key === 'fixed' ? 128 : 292})`}>
            <circle className={cn(styles.ripple, route.key === 'refund' && styles.ripplePay)} style={{ '--at': `${END_AT}s` }} r="14" />
            <g className={styles.arrived} style={{ '--at': `${END_AT + 0.45}s` }}>
              <circle className={route.key === 'refund' ? styles.arrivedPay : undefined} r="14" />
              {route.key === 'fixed' ? (
                <path d="M -6 0.5 L -1.5 5 L 6.5 -4.5" />
              ) : (
                <text y="4" textAnchor="middle">
                  Rs
                </text>
              )}
            </g>
          </g>

          {/* The train: an olive carriage with a framed picture on board and its lamp lit. */}
          <g className={styles.train}>
            <path className={styles.beam} d="M 20 -4 L 46 -12 L 46 12 L 20 4 Z" />
            <rect className={styles.carriage} x="-23" y="-12" width="46" height="24" rx="9" />
            <rect className={styles.window} x="-16" y="-6.5" width="9" height="13" rx="2" />
            <rect className={styles.cargo} x="-4" y="-7.5" width="12" height="15" rx="1" />
            <rect className={styles.cargoArt} x="-1.5" y="-5" width="7" height="10" />
            <circle className={styles.lamp} cx="16" cy="0" r="3.2" />
            <animateMotion dur={`${SECONDS}s`} fill="freeze" rotate="auto" keyPoints="0;0;1;1" keyTimes={KEY_TIMES} calcMode="spline" keySplines={KEY_SPLINES} path={route.d} />
          </g>
        </svg>
      )}
    </div>
  );
}
