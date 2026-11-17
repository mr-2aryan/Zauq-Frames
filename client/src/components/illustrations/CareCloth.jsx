import { C } from './palette.js';
import { Svg } from './Svg.jsx';

/** A framed print being dusted with a soft cloth, with small "keep away from sun and damp" signs. */
export function CareCloth({ className }) {
  return (
    <Svg className={className}>
      <rect x="20" y="24" width="440" height="352" rx="36" fill={C.cream} />
      {/* Frame */}
      <rect x="120" y="64" width="190" height="240" rx="4" fill={C.frame} />
      <rect x="132" y="76" width="166" height="216" fill={C.paper} />
      <path d="M150 112 c30 -30 70 -18 84 8 c-22 -12 -50 -6 -60 18 M188 168 c24 -14 50 -8 60 10" stroke={C.olive} strokeWidth="6" strokeLinecap="round" />
      <path d="M150 262 h130 M150 240 h90" stroke={C.sage} strokeWidth="8" strokeLinecap="round" />
      {/* Cloth */}
      <path d="M268 176 c34 -14 72 -6 92 18 c-8 30 -30 50 -62 54 c-22 -16 -34 -42 -30 -72 Z" fill={C.sage} />
      <path d="M282 196 c18 -6 38 -2 50 10 M290 220 c14 -4 28 -2 38 6" stroke={C.oliveSoft} strokeWidth="3" strokeLinecap="round" />
      {/* Sparkles */}
      {[
        [104, 96, 12],
        [334, 120, 9],
        [100, 220, 8],
      ].map(([x, y, r]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`} fill={C.accent} />
      ))}
      {/* No direct sun */}
      <g transform="translate(372 290)">
        <circle r="30" fill={C.paper} stroke={C.line} strokeWidth="2" />
        <circle r="9" fill={C.accent} />
        <path d="M0 -20 v-4 M0 20 v4 M-20 0 h-4 M20 0 h4 M-14 -14 l-3 -3 M14 14 l3 3 M14 -14 l3 -3 M-14 14 l-3 3" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
        <path d="M-21 -21 L21 21" stroke={C.dark} strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* No damp */}
      <g transform="translate(70 318)">
        <circle r="30" fill={C.paper} stroke={C.line} strokeWidth="2" />
        <path d="M0 -14 c-8 10 -12 16 -12 22 a12 12 0 0 0 24 0 c0 -6 -4 -12 -12 -22 Z" fill={C.olive} />
        <path d="M-21 -21 L21 21" stroke={C.dark} strokeWidth="4" strokeLinecap="round" />
      </g>
    </Svg>
  );
}
