import { C } from './palette.js';
import { Svg } from './Svg.jsx';

/** A shield with a tick in front of a framed print: covered if something goes wrong. */
export function ShieldCheck({ className }) {
  return (
    <Svg className={className}>
      <rect x="20" y="24" width="440" height="352" rx="36" fill={C.cream} />
      <circle cx="240" cy="200" r="130" fill={C.sage} opacity="0.5" />
      {/* Frame behind */}
      <rect x="84" y="86" width="150" height="190" rx="3" fill={C.frame} transform="rotate(-8 159 181)" />
      <rect x="96" y="98" width="126" height="166" fill={C.tint} transform="rotate(-8 159 181)" />
      <path d="M108 240 L146 190 L172 216 L196 192 L226 230" stroke={C.oliveSoft} strokeWidth="8" strokeLinejoin="round" transform="rotate(-8 159 181)" />
      {/* Shield */}
      <path d="M290 92 L382 126 V200 C382 258 344 298 290 318 C236 298 198 258 198 200 V126 Z" fill={C.olive} />
      <path d="M290 112 L364 140 V200 C364 246 334 278 290 296 Z" fill={C.oliveSoft} opacity="0.55" />
      <path d="M248 204 L280 236 L338 172" stroke={C.cream} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sparkles */}
      <circle cx="404" cy="96" r="7" fill={C.accent} />
      <circle cx="96" cy="320" r="10" fill={C.accent} opacity="0.85" />
    </Svg>
  );
}
