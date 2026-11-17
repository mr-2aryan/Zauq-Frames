import { C } from './palette.js';
import { Svg } from './Svg.jsx';

/** A studio workbench under a lamp: a frame being assembled, a print, a ruler and a brush. */
export function Workbench({ className }) {
  return (
    <Svg className={className}>
      <rect x="20" y="24" width="440" height="352" rx="36" fill={C.cream} />
      {/* Lamp and its light */}
      <path d="M240 24 V70" stroke={C.dark} strokeWidth="3" />
      <path d="M206 92 L274 92 L258 70 L222 70 Z" fill={C.olive} />
      <path d="M210 94 L270 94 L360 272 L120 272 Z" fill={C.sage} opacity="0.45" />
      {/* Bench */}
      <rect x="56" y="272" width="368" height="18" rx="5" fill={C.olive} />
      <rect x="78" y="290" width="14" height="70" fill={C.olive} />
      <rect x="388" y="290" width="14" height="70" fill={C.olive} />
      <rect x="92" y="326" width="296" height="8" fill={C.oliveSoft} opacity="0.6" />
      {/* Print sliding into the frame */}
      <rect x="132" y="176" width="150" height="96" rx="3" fill={C.frame} />
      <rect x="142" y="186" width="130" height="76" fill={C.tint} />
      <rect x="168" y="150" width="128" height="86" rx="2" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <circle cx="262" cy="176" r="12" fill={C.accent} />
      <path d="M168 222 L204 188 L230 210 L256 190 L296 222 L296 236 L168 236 Z" fill={C.olive} />
      {/* Corner clamp */}
      <path d="M126 266 h26 v-8 h-18 v-18 h-8 Z" fill={C.accent} />
      {/* Ruler */}
      <rect x="300" y="250" width="104" height="18" rx="3" fill={C.sand} />
      {[310, 322, 334, 346, 358, 370, 382, 394].map((x, i) => (
        <path key={x} d={`M${x} 250 v${i % 2 ? 6 : 10}`} stroke={C.dark} strokeWidth="2" />
      ))}
      {/* Brush */}
      <path d="M96 262 l52 -40" stroke={C.dark} strokeWidth="6" strokeLinecap="round" />
      <path d="M144 226 l14 -12 l6 8 l-14 10 Z" fill={C.oliveSoft} />
    </Svg>
  );
}
