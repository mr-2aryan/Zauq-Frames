import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import styles from './FramingBench.module.css';

/** Pieces made one after another, in a loop; every other one is ordered with a mat. */
const ARTWORK = ['/images/art/vinyl-dance.jpg', '/images/art/uduni-astajib-lakum.jpg', '/images/art/paparazzi.jpg', '/images/art/tawakkul-sabr-shukr.jpg'];
const withMat = (cycle) => cycle % 2 === 1;

/** One piece, start to finish (keep in step with the 11s animations in the CSS). */
const CYCLE_MS = 11000;
/** When each step starts, as a share of the cycle; the last entry is when it's all done. */
const STEP_STARTS = [0.01, 0.09, 0.19, 0.38, 0.49, 0.57, 0.96];

const W = 520;
/** The frame on the mat: outer box and moulding width; the mat's width when there is one. */
const FX = 165;
const FY = 104;
const FW = 190;
const FH = 240;
const M = 15;
const MAT = 18;

/**
 * A framer's bench seen from above: an order note arrives, a print slides in,
 * a white mat is cut for it when the customer asked for one, four moulding bars
 * close around it and join at the corners, it's polished, a "checked"
 * stamp lands, and it's packed in a kraft carton sealed with Zauq tape — then
 * the next piece. Tools lie around: a steel ruler, a pencil, a roll of Zauq tape
 * and logo stickers.
 *
 * `bare` leaves out the bench and cutting mat, for a page that draws them across
 * the whole hero. Pauses while off screen; with reduced motion it shows a
 * finished, matted frame.
 * @param {{ bare?: boolean, className?: string }} props
 */
export function FramingBench({ bare = false, className }) {
  const id = useId().replace(/:/g, '');
  const rootRef = useRef(null);
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [cycle, setCycle] = useState(still ? 1 : 0);
  // Which step is under way: -1 none yet, 0–5 a step, 6 all done.
  const [phase, setPhase] = useState(still ? STEP_STARTS.length - 1 : -1);
  const [onScreen, setOnScreen] = useState(true);
  const running = !still && onScreen;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setCycle((value) => value + 1), CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [running]);

  // The steps light up in time with the animation, from the start of each piece.
  useEffect(() => {
    if (!running) return undefined;
    const timers = [window.setTimeout(() => setPhase(-1), 0), ...STEP_STARTS.map((start, index) => window.setTimeout(() => setPhase(index), start * CYCLE_MS))];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [cycle, running]);

  const art = ARTWORK[cycle % ARTWORK.length];
  const mat = withMat(cycle);
  const steps = ['Printed', mat ? 'Mat' : 'No mat', 'Framed', 'Finished', 'Checked', 'Packed'];
  const x1 = FX + FW;
  const y1 = FY + FH;
  // The print sits inside the moulding, or inside the mat.
  const inset = M - 2 + (mat ? MAT : 0);
  const print = { x: FX + inset, y: FY + inset, w: FW - inset * 2, h: FH - inset * 2 };
  // The carton: a little bigger than the frame all round.
  const box = { x: FX - 12, y: FY - 12, w: FW + 24, h: FH + 24 };

  return (
    <svg
      ref={rootRef}
      viewBox={`0 0 ${W} ${W}`}
      role="img"
      aria-label="A frame being made on a framer's bench: printed, matted if asked for, framed, finished, checked and packed"
      className={cn(styles.art, bare && styles.bare, !running && styles.paused, still && styles.still, className)}
    >
      <defs>
        <linearGradient id={`${id}wood`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dcc6a2" />
          <stop offset="1" stopColor="#cdb38c" />
        </linearGradient>
        <linearGradient id={`${id}steel`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e4e7e1" />
          <stop offset="1" stopColor="#b8bdb4" />
        </linearGradient>
        <linearGradient id={`${id}sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}card`}>
          <rect width={W} height={W} rx="28" />
        </clipPath>
        <clipPath id={`${id}opening`}>
          <rect x={FX + M - 2} y={FY + M - 2} width={FW - M * 2 + 4} height={FH - M * 2 + 4} />
        </clipPath>
        <clipPath id={`${id}box`}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="3" />
        </clipPath>
        <path id={`${id}tapePath`} d="M 420 330 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" />
      </defs>

      <g clipPath={bare ? undefined : `url(#${id}card)`}>
        {!bare && (
          <>
            {/* The bench and its cutting mat. */}
            <rect width={W} height={W} fill={`url(#${id}wood)`} />
            <g stroke="rgba(110, 80, 40, 0.12)" strokeWidth="1.2" fill="none">
              <path d="M0 12 C 160 4, 340 20, 520 10" />
              <path d="M0 506 C 180 498, 330 514, 520 504" />
              <path d="M12 0 C 6 160, 18 360, 10 520" />
              <path d="M508 0 C 514 170, 502 350, 510 520" />
            </g>
            <rect x="26" y="26" width="468" height="468" rx="14" fill="#43512a" />
            <g stroke="rgba(255, 255, 255, 0.07)" strokeWidth="1">
              {Array.from({ length: 25 }, (_, i) => 44 + i * 18).map((v) => (
                <g key={v}>
                  <line x1={v} y1="26" x2={v} y2="494" />
                  <line x1="26" y1={v} x2="494" y2={v} />
                </g>
              ))}
            </g>
            <g stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1">
              {[116, 206, 296, 386].map((v) => (
                <g key={v}>
                  <line x1={v} y1="26" x2={v} y2="494" />
                  <line x1="26" y1={v} x2="494" y2={v} />
                </g>
              ))}
            </g>
          </>
        )}

        {/* Steel ruler, left. */}
        <g>
          <rect x="50" y="96" width="26" height="250" rx="3" fill={`url(#${id}steel)`} />
          <g stroke="#6b7068" strokeWidth="1">
            {Array.from({ length: 31 }, (_, i) => 102 + i * 8).map((y, i) => (
              <line key={y} x1={76 - (i % 5 === 0 ? 11 : 6)} y1={y} x2="76" y2={y} />
            ))}
          </g>
        </g>

        {/* Pencil, top right. */}
        <g transform="rotate(-32 430 96)">
          <rect x="374" y="89" width="104" height="14" fill="#e8b33a" />
          <rect x="374" y="93" width="104" height="2" fill="#d29b22" />
          <rect x="478" y="89" width="9" height="14" fill="#c9cbc4" />
          <rect x="487" y="89" width="12" height="14" rx="3" fill="#d98c8c" />
          <path d="M374 89 L352 96 L374 103 Z" fill="#ead2a6" />
          <path d="M359 94 L352 96 L359 98 Z" fill="#33352e" />
        </g>

        {/* A roll of Zauq tape, bottom right. */}
        <g>
          <circle cx="420" cy="330" r="46" fill="rgba(255, 250, 236, 0.42)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" />
          <text fontSize="9" fontWeight="800" fill="#141410" letterSpacing="2">
            <textPath href={`#${id}tapePath`}>ZAUQ · ZAUQ · ZAUQ · ZAUQ · ZAUQ ·</textPath>
          </text>
          <circle cx="420" cy="330" r="25" fill="#c49c6a" />
          <circle cx="420" cy="330" r="18" fill={bare ? 'rgba(0, 0, 0, 0.18)' : '#43512a'} />
        </g>

        {/* Logo stickers, bottom left. */}
        <g>
          <rect x="66" y="372" width="86" height="48" rx="4" fill="#efece3" transform="rotate(-8 109 396)" />
          <g transform="rotate(4 112 394)">
            <rect x="69" y="370" width="86" height="48" rx="4" fill="#fbfaf6" />
            <text x="112" y="395" textAnchor="middle" fontSize="13" fontWeight="800" fill="#17190f" letterSpacing="2.5">
              ZAUQ
            </text>
            <text x="112" y="406" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#17190f" letterSpacing="1.6">
              PREMIUM FRAMES
            </text>
          </g>
        </g>

        {/* Moulding offcuts. */}
        <path d="M300 400 L352 400 L346 410 L306 410 Z" fill="#17190f" />
        <path d="M318 416 L356 416 L350 426 L324 426 Z" fill="#23261b" />

        {/* The piece being made — restarted for every one. */}
        <g key={cycle} className={styles.piece}>
          {/* The customer's note. */}
          <g className={styles.note} transform="rotate(-3 166 52)">
            <rect x="92" y="30" width="150" height="46" rx="4" fill="#fbfaf6" />
            <circle cx="104" cy="42" r="4" fill="#c8643b" />
            <text x="114" y="45" fontSize="7.5" fontWeight="800" fill="#7a7e6e" letterSpacing="1.2">
              CUSTOMER NOTE
            </text>
            <text x="104" y="64" fontSize="12" fontWeight="800" fill="#1C1F17">
              {mat ? 'White mat, please' : 'Edge to edge'}
            </text>
          </g>

          <rect className={styles.shadow} x={FX + 6} y={FY + 10} width={FW} height={FH} rx="2" fill="rgba(10, 14, 4, 0.35)" />
          <image className={styles.print} href={art} x={print.x} y={print.y} width={print.w} height={print.h} preserveAspectRatio="xMidYMid slice" />

          {mat && (
            <path
              className={styles.mat}
              fillRule="evenodd"
              fill="#fbfaf6"
              stroke="#e4dfd2"
              strokeWidth="1.5"
              d={`M${FX + M - 2} ${FY + M - 2} h${FW - M * 2 + 4} v${FH - M * 2 + 4} h-${FW - M * 2 + 4} Z M${print.x} ${print.y} v${print.h} h${print.w} v-${print.h} Z`}
            />
          )}

          <g fill="#17190f" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1">
            <path className={styles.barTop} d={`M${FX} ${FY} L${x1} ${FY} L${x1 - M} ${FY + M} L${FX + M} ${FY + M} Z`} />
            <path className={styles.barBottom} d={`M${FX} ${y1} L${x1} ${y1} L${x1 - M} ${y1 - M} L${FX + M} ${y1 - M} Z`} />
            <path className={styles.barLeft} d={`M${FX} ${FY} L${FX + M} ${FY + M} L${FX + M} ${y1 - M} L${FX} ${y1} Z`} />
            <path className={styles.barRight} d={`M${x1} ${FY} L${x1 - M} ${FY + M} L${x1 - M} ${y1 - M} L${x1} ${y1} Z`} />
          </g>
          <g className={styles.joins} fill="#e8b33a">
            {[
              [FX + 6, FY + 6],
              [x1 - 6, FY + 6],
              [FX + 6, y1 - 6],
              [x1 - 6, y1 - 6],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
            ))}
          </g>
          <g clipPath={`url(#${id}opening)`}>
            <rect className={styles.sweep} x={FX - 60} y={FY} width="80" height={FH} fill={`url(#${id}sweep)`} />
          </g>
          <g className={styles.stamp}>
            <circle cx={x1 - 4} cy={y1 - 6} r="27" fill="#fbfaf6" />
            <circle cx={x1 - 4} cy={y1 - 6} r="23" fill="none" stroke="#3E4A1F" strokeWidth="2" />
            <path d={`M${x1 - 14} ${y1 - 8} l7 7 l13 -14`} fill="none" stroke="#3E4A1F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Packed: a kraft carton made to the frame, sealed with two bands of Zauq tape. */}
          <g className={styles.carton}>
            <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="3" fill="#c49c6a" />
            <g clipPath={`url(#${id}box)`} stroke="rgba(90, 60, 25, 0.12)" strokeWidth="2">
              {Array.from({ length: 12 }, (_, i) => box.x + 8 + i * 18).map((x) => (
                <line key={x} x1={x} y1={box.y} x2={x} y2={box.y + box.h} />
              ))}
            </g>
            <line x1={box.x + box.w / 2} y1={box.y + 2} x2={box.x + box.w / 2} y2={box.y + box.h - 2} stroke="rgba(70, 45, 15, 0.35)" strokeWidth="1.5" />
            <rect x={box.x + 0.5} y={box.y + 0.5} width={box.w - 1} height={box.h - 1} rx="3" fill="none" stroke="rgba(70, 45, 15, 0.3)" />
          </g>
          {[0.24, 0.76].map((at, index) => (
            <g key={at} className={index === 0 ? styles.tapeOne : styles.tapeTwo}>
              <rect x={box.x - 4} y={box.y + box.h * at - 13} width={box.w + 8} height="26" fill="rgba(255, 250, 236, 0.62)" />
              <rect x={box.x - 4} y={box.y + box.h * at - 13} width={box.w + 8} height="1.5" fill="rgba(255, 255, 255, 0.8)" />
              <rect x={box.x - 4} y={box.y + box.h * at + 11.5} width={box.w + 8} height="1.5" fill="rgba(255, 255, 255, 0.8)" />
              <text x={box.x + box.w / 2} y={box.y + box.h * at + 4.5} textAnchor="middle" fontSize="12" fontWeight="800" fill="#0d0d0b" letterSpacing="3">
                ZAUQ · ZAUQ · ZAUQ
              </text>
            </g>
          ))}
        </g>

        {/* The steps, lit as each happens. */}
        {steps.map((step, index) => (
          <g
            key={index}
            className={cn(styles.step, phase === index && styles.stepOn, phase > index && styles.stepDone)}
            transform={`translate(${36 + index * 76} 450)`}
          >
            <rect width="70" height="26" rx="13" />
            <text x="35" y="17.5" textAnchor="middle" fontSize="11.5" fontWeight="800">
              {step}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
