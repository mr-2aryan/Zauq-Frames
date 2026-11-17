import { C } from './palette.js';
import { Svg } from './Svg.jsx';

/** A page of terms with a seal and a pen. */
export function DocumentIllustration({ className }) {
  return (
    <Svg className={className}>
      <rect x="20" y="24" width="440" height="352" rx="36" fill={C.cream} />
      <rect x="150" y="66" width="200" height="262" rx="10" fill={C.sage} transform="rotate(6 250 197)" />
      <path d="M120 58 h158 l52 52 v214 a10 10 0 0 1 -10 10 h-200 a10 10 0 0 1 -10 -10 v-256 a10 10 0 0 1 10 -10 Z" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <path d="M278 58 v42 a10 10 0 0 0 10 10 h42" fill={C.tint} stroke={C.line} strokeWidth="2" />
      <rect x="140" y="86" width="96" height="12" rx="6" fill={C.olive} />
      {[124, 148, 172, 196, 220].map((y, i) => (
        <rect key={y} x="140" y={y} width={i % 2 ? 150 : 168} height="8" rx="4" fill={C.line} />
      ))}
      <rect x="140" y="252" width="110" height="8" rx="4" fill={C.line} />
      {/* Seal */}
      <circle cx="286" cy="290" r="28" fill={C.olive} />
      <circle cx="286" cy="290" r="18" fill="none" stroke={C.cream} strokeWidth="3" />
      <path d="M276 290 l7 7 l14 -14" stroke={C.cream} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Pen */}
      <path d="M352 318 L410 140" stroke={C.dark} strokeWidth="12" strokeLinecap="round" />
      <path d="M346 334 l4 -18 l10 4 Z" fill={C.accent} />
    </Svg>
  );
}
