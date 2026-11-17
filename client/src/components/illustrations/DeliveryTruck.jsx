import { C } from './palette.js';
import { Svg } from './Svg.jsx';

/** A delivery van carrying a framed parcel, following a dotted route to a map pin. */
export function DeliveryTruck({ className }) {
  return (
    <Svg className={className}>
      <rect x="20" y="24" width="440" height="352" rx="36" fill={C.cream} />
      {/* Route and pin */}
      <path d="M70 120 C140 60 220 150 300 96 S400 70 410 96" stroke={C.olive} strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" />
      <circle cx="70" cy="120" r="9" fill={C.olive} />
      <path d="M410 56 c-18 0 -30 13 -30 30 c0 22 30 50 30 50 s30 -28 30 -50 c0 -17 -12 -30 -30 -30 Z" fill={C.accent} />
      <circle cx="410" cy="86" r="10" fill={C.cream} />
      {/* Road */}
      <rect x="20" y="318" width="440" height="58" fill={C.sage} opacity="0.6" />
      <path d="M50 346 h60 M150 346 h60 M250 346 h60 M350 346 h60" stroke={C.cream} strokeWidth="6" strokeLinecap="round" />
      {/* Van */}
      <rect x="92" y="190" width="206" height="118" rx="10" fill={C.olive} />
      <path d="M298 214 h58 c10 0 18 6 22 14 l22 40 c3 5 4 10 4 15 v15 c0 6 -4 10 -10 10 h-96 Z" fill={C.dark} />
      <path d="M312 228 h42 l20 36 h-62 Z" fill={C.tint} />
      <rect x="92" y="290" width="312" height="18" rx="6" fill={C.frame} />
      {/* Framed parcel on the side */}
      <rect x="132" y="210" width="96" height="70" rx="3" fill={C.frame} />
      <rect x="140" y="218" width="80" height="54" fill={C.cream} />
      <circle cx="200" cy="234" r="8" fill={C.accent} />
      <path d="M140 264 L168 238 L186 254 L204 240 L220 256 V272 H140 Z" fill={C.oliveSoft} />
      {/* Wheels */}
      {[150, 340].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="312" r="24" fill={C.frame} />
          <circle cx={cx} cy="312" r="10" fill={C.sage} />
        </g>
      ))}
      {/* Speed lines */}
      <path d="M40 220 h36 M28 248 h48 M44 276 h32" stroke={C.oliveSoft} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}
