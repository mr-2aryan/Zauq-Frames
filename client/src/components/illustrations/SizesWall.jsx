import { useId } from 'react';
import { cn } from '@/utils/cn';
import styles from './SizesWall.module.css';

/** One real piece per frame, smallest to largest (cycled if there are more sizes). */
const ARTWORK = [
  '/images/sizes/vinyl-dance.jpg',
  '/images/sizes/square-kufic.jpg',
  '/images/sizes/i-can-and-i-will.jpg',
  '/images/sizes/uduni-astajib-lakum.jpg',
  '/images/sizes/paparazzi.jpg',
  '/images/sizes/tawakkul-sabr-shukr.jpg',
];

const W = 520;
const H = 560;
/** Where things stand, in drawing units (px of the 520 × 560 view). */
const FLOOR_Y = 432;
const LEDGE_Y = 250;
const MARGIN = 28;
const GAP = 12;
const SOFA_IN = 84;
/** Moulding width in the drawing; frames this long or longer (in inches) get twice as wide a moulding. */
const FRAME_EDGE = 3.5;
const LARGE_FRAME_IN = 40;

/**
 * Every frame size drawn to scale, standing on a picture ledge above an 84 in
 * three-seater sofa in a simple room — each frame holding a real Zauq piece.
 * `bare` leaves out the wall and floor, for a page that draws the room itself:
 * the floor line is then 128/520 of the drawing's width above its bottom edge.
 * @param {{ sizes: Array<{ id: string, width: number, height: number }>, premiumId?: string, bare?: boolean, className?: string }} props
 */
export function SizesWall({ sizes, premiumId, bare = false, className }) {
  const id = useId().replace(/:/g, '');
  // As large as the row of frames allows, and never so large the sofa won't fit.
  const totalInches = sizes.reduce((sum, size) => sum + size.width, 0);
  const scale = Math.min(3.6, (W - MARGIN * 2 - GAP * (sizes.length - 1)) / totalInches);
  const rowWidth = totalInches * scale + GAP * (sizes.length - 1);
  // Left edge of each frame: side by side with a gap, centred as a group.
  const lefts = sizes.reduce((acc, size, index) => [...acc, index === 0 ? (W - rowWidth) / 2 : acc[index - 1] + sizes[index - 1].width * scale + GAP], []);
  const frames = sizes.map((size, index) => {
    const w = size.width * scale;
    const h = size.height * scale;
    const edge = size.height >= LARGE_FRAME_IN ? FRAME_EDGE * 2 : FRAME_EDGE;
    return { size, x: lefts[index], y: LEDGE_Y - h, w, h, edge, art: ARTWORK[index % ARTWORK.length] };
  });

  const sofaW = SOFA_IN * scale;
  const sofaX = (W - sofaW) / 2;
  const sofaTop = FLOOR_Y - 34 * scale;
  const mid = sofaX + sofaW / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Every frame size drawn to scale on a picture ledge above an 84 inch three-seater sofa" className={cn(styles.art, bare && styles.bare, className)}>
      <defs>
        <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f4ee" />
          <stop offset="1" stopColor="#ebe8de" />
        </linearGradient>
        <linearGradient id={`${id}floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c3a0" />
          <stop offset="1" stopColor="#cdb48c" />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3cf" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff3cf" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}room`}>
          <rect width={W} height={H} rx="28" />
        </clipPath>
        {frames.map((frame) => (
          <clipPath key={frame.size.id} id={`${id}art-${frame.size.id}`}>
            <rect x={frame.x + frame.edge} y={frame.y + frame.edge} width={frame.w - frame.edge * 2} height={frame.h - frame.edge * 2} />
          </clipPath>
        ))}
      </defs>

      <g clipPath={bare ? undefined : `url(#${id}room)`}>
        {/* The room: wall, skirting board and a wooden floor. */}
        {!bare && (
          <>
        <rect width={W} height={FLOOR_Y} fill={`url(#${id}wall)`} />
        <rect y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill={`url(#${id}floor)`} />
        <g stroke="rgba(110, 80, 40, 0.14)" strokeWidth="1">
          {[462, 496, 532].map((y, row) => (
            <g key={y}>
              <line x1="0" y1={y} x2={W} y2={y} />
              {[60, 190, 330, 450].map((x) => (
                <line key={x} x1={x + (row % 2) * 65} y1={y - (row === 0 ? 30 : 34)} x2={x + (row % 2) * 65} y2={y} />
              ))}
            </g>
          ))}
        </g>
        <rect y={FLOOR_Y - 10} width={W} height="12" fill="#fbfaf6" />
        <rect y={FLOOR_Y + 1} width={W} height="2" fill="rgba(90, 70, 40, 0.18)" />
          </>
        )}

        {/* The frames, standing on the ledge. */}
        {frames.map((frame) => {
          const premium = frame.size.id === premiumId;
          return (
            <g key={frame.size.id}>
              <rect x={frame.x + 3} y={frame.y + 4} width={frame.w} height={frame.h} fill="rgba(40, 32, 20, 0.16)" rx="1" />
              <rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} fill="#17190f" rx="1" />
              <image
                href={frame.art}
                x={frame.x + frame.edge}
                y={frame.y + frame.edge}
                width={frame.w - frame.edge * 2}
                height={frame.h - frame.edge * 2}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${id}art-${frame.size.id})`}
              />
              {premium && (
                <g transform={`translate(${frame.x + frame.w / 2} ${frame.y - 14})`}>
                  <rect x="-30" y="-10" width="60" height="19" rx="9.5" fill="#3E4A1F" />
                  <text y="3.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff" letterSpacing="0.04em">
                    PREMIUM
                  </text>
                </g>
              )}
              <text x={frame.x + frame.w / 2} y={LEDGE_Y + 26} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={premium ? '#3E4A1F' : '#1C1F17'}>
                {frame.size.width}×{frame.size.height}
              </text>
            </g>
          );
        })}

        {/* The picture ledge: walnut, with a lip in front of the frames. */}
        <rect x="18" y={LEDGE_Y + 7} width={W - 36} height="6" fill="rgba(40, 30, 20, 0.12)" />
        <rect x="18" y={LEDGE_Y - 3} width={W - 36} height="10" rx="2" fill="#6b5640" />
        <rect x="18" y={LEDGE_Y - 3} width={W - 36} height="2" rx="1" fill="#8a7154" />

        {/* Floor lamp, left. */}
        <g>
          <ellipse cx="62" cy={FLOOR_Y - 1} rx="18" ry="4" fill="#2b2a24" />
          <rect x="60.5" y="318" width="3" height={FLOOR_Y - 318} fill="#2b2a24" />
          <circle cx="62" cy="326" r="40" fill={`url(#${id}glow)`} />
          <path d="M44 330 L80 330 L72 296 L52 296 Z" fill="#f3e7cc" stroke="#d8c7a2" />
        </g>

        {/* Side table with a plant, right. */}
        <g>
          <rect x="430" y={FLOOR_Y - 72} width="50" height="6" rx="2" fill="#6b5640" />
          <rect x="436" y={FLOOR_Y - 66} width="3.5" height="66" fill="#5c4632" />
          <rect x="470.5" y={FLOOR_Y - 66} width="3.5" height="66" fill="#5c4632" />
          <path d={`M443 ${FLOOR_Y - 72} L467 ${FLOOR_Y - 72} L464 ${FLOOR_Y - 94} L446 ${FLOOR_Y - 94} Z`} fill="#b5563a" />
          <g fill="#6f8a3a">
            <ellipse cx="455" cy={FLOOR_Y - 112} rx="7" ry="19" />
            <ellipse cx="444" cy={FLOOR_Y - 106} rx="6" ry="16" transform={`rotate(-28 444 ${FLOOR_Y - 106})`} />
            <ellipse cx="466" cy={FLOOR_Y - 106} rx="6" ry="16" transform={`rotate(28 466 ${FLOOR_Y - 106})`} />
          </g>
          <g fill="#86a24b">
            <ellipse cx="449" cy={FLOOR_Y - 118} rx="4.5" ry="13" transform={`rotate(-12 449 ${FLOOR_Y - 118})`} />
            <ellipse cx="461" cy={FLOOR_Y - 117} rx="4.5" ry="13" transform={`rotate(14 461 ${FLOOR_Y - 117})`} />
          </g>
        </g>

        {/* The sofa, 84 in wide, to the same scale. */}
        <g>
          <ellipse cx={mid} cy={FLOOR_Y + 1} rx={sofaW / 2 + 10} ry="6" fill="rgba(40, 30, 20, 0.16)" />
          <rect x={sofaX + 16} y={FLOOR_Y - 14} width="6" height="14" rx="1.5" fill="#5c4632" />
          <rect x={sofaX + sofaW - 22} y={FLOOR_Y - 14} width="6" height="14" rx="1.5" fill="#5c4632" />
          <rect x={sofaX + 18} y={sofaTop} width={sofaW - 36} height={(FLOOR_Y - 14 - sofaTop) * 0.62} rx="16" fill="#aeb98e" />
          <rect x={sofaX + 26} y={sofaTop + 6} width={sofaW / 2 - 30} height="52" rx="14" fill="#bcc59f" />
          <rect x={mid + 4} y={sofaTop + 6} width={sofaW / 2 - 30} height="52" rx="14" fill="#bcc59f" />
          <rect x={sofaX + 4} y={FLOOR_Y - 66} width={sofaW - 8} height="52" rx="12" fill="#a3ae82" />
          <rect x={sofaX + 26} y={FLOOR_Y - 70} width={sofaW / 2 - 28} height="26" rx="10" fill="#c5cdab" />
          <rect x={mid + 2} y={FLOOR_Y - 70} width={sofaW / 2 - 28} height="26" rx="10" fill="#c5cdab" />
          <rect x={sofaX - 4} y={FLOOR_Y - 86} width="32" height="72" rx="14" fill="#b3bd93" />
          <rect x={sofaX + sofaW - 28} y={FLOOR_Y - 86} width="32" height="72" rx="14" fill="#b3bd93" />
          <rect x={sofaX + 34} y={sofaTop + 22} width="38" height="34" rx="9" fill="#c8643b" transform={`rotate(-9 ${sofaX + 53} ${sofaTop + 39})`} />
          <rect x={sofaX + sofaW - 72} y={sofaTop + 22} width="38" height="34" rx="9" fill="#3E4A1F" transform={`rotate(9 ${sofaX + sofaW - 53} ${sofaTop + 39})`} />
        </g>

        {/* The sofa's width, marked on the floor. */}
        <g fill="none" stroke="#6b5a40" strokeWidth="1.3">
          <line x1={sofaX} y1="478" x2={sofaX + sofaW} y2="478" />
          <line x1={sofaX} y1="471" x2={sofaX} y2="485" />
          <line x1={sofaX + sofaW} y1="471" x2={sofaX + sofaW} y2="485" />
        </g>
        <g transform={`translate(${mid} 478)`}>
          <rect x="-74" y="-12" width="148" height="24" rx="12" fill="#fbf7ee" stroke="#e2d4b8" />
          <text y="4" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#4a3d2a">
            Sofa · 84 in (213 cm)
          </text>
        </g>
      </g>
    </svg>
  );
}
