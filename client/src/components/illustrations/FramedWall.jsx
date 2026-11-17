import { C } from './palette.js';
import { Svg } from './Svg.jsx';

/** A wall hung salon-style above a console: one large landscape print and two smaller frames. */
export function FramedWall({ className }) {
  return (
    <Svg className={className}>
      <rect x="20" y="24" width="440" height="352" rx="36" fill={C.cream} />
      <circle cx="380" cy="86" r="56" fill={C.sage} opacity="0.55" />
      {/* Large frame */}
      <rect x="150" y="70" width="186" height="226" rx="4" fill={C.frame} />
      <rect x="162" y="82" width="162" height="202" fill={C.paper} />
      <circle cx="270" cy="140" r="22" fill={C.accent} />
      <path d="M162 250 L210 186 L242 222 L274 176 L324 240 L324 284 L162 284 Z" fill={C.olive} />
      <path d="M162 262 L200 222 L236 252 L268 214 L324 266 L324 284 L162 284 Z" fill={C.oliveSoft} />
      {/* Small frame, left */}
      <rect x="62" y="118" width="70" height="92" rx="3" fill={C.frame} />
      <rect x="69" y="125" width="56" height="78" fill={C.tint} />
      <path d="M81 203 V170 a16 16 0 0 1 32 0 V203" stroke={C.olive} strokeWidth="5" />
      {/* Small frame, right */}
      <rect x="354" y="104" width="76" height="98" rx="3" fill={C.frame} />
      <rect x="361" y="111" width="62" height="84" fill={C.olive} />
      <path d="M374 168 c8 -22 30 -22 36 -4 c-10 -6 -22 -4 -26 8 M384 140 c10 -6 20 -4 24 4" stroke={C.cream} strokeWidth="3.5" strokeLinecap="round" />
      {/* Console, vase and plant */}
      <rect x="70" y="314" width="340" height="14" rx="4" fill={C.olive} />
      <rect x="92" y="328" width="10" height="34" fill={C.olive} />
      <rect x="378" y="328" width="10" height="34" fill={C.olive} />
      <path d="M104 314 c-14 -6 -16 -30 -2 -38 h16 c14 8 12 32 -2 38 Z" fill={C.sand} />
      <path d="M110 278 c-2 -28 -18 -46 -36 -52 c12 14 18 30 22 50 M112 278 c4 -30 20 -48 40 -54 c-14 16 -22 34 -26 54" stroke={C.oliveSoft} strokeWidth="4" strokeLinecap="round" />
      <rect x="330" y="298" width="46" height="16" rx="3" fill={C.sage} />
      <rect x="336" y="288" width="34" height="10" rx="3" fill={C.accent} opacity="0.85" />
    </Svg>
  );
}
