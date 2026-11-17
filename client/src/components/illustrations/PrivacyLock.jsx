import { C } from './palette.js';
import { Svg } from './Svg.jsx';

/** A padlock over a personal-details card: your data, kept safe. */
export function PrivacyLock({ className }) {
  return (
    <Svg className={className}>
      <rect x="20" y="24" width="440" height="352" rx="36" fill={C.cream} />
      {/* Details card */}
      <rect x="70" y="92" width="250" height="168" rx="16" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <circle cx="120" cy="146" r="26" fill={C.sage} />
      <circle cx="120" cy="138" r="10" fill={C.olive} />
      <path d="M100 162 c6 -12 34 -12 40 0" stroke={C.olive} strokeWidth="6" strokeLinecap="round" />
      <rect x="162" y="128" width="120" height="10" rx="5" fill={C.olive} />
      <rect x="162" y="150" width="96" height="8" rx="4" fill={C.line} />
      <rect x="96" y="196" width="196" height="8" rx="4" fill={C.line} />
      <rect x="96" y="218" width="150" height="8" rx="4" fill={C.line} />
      {/* Padlock */}
      <path d="M300 196 v-36 a44 44 0 0 1 88 0 v36" stroke={C.dark} strokeWidth="16" />
      <rect x="276" y="190" width="136" height="128" rx="20" fill={C.olive} />
      <circle cx="344" cy="244" r="14" fill={C.cream} />
      <rect x="338" y="248" width="12" height="34" rx="6" fill={C.cream} />
      <circle cx="410" cy="110" r="8" fill={C.accent} />
      <circle cx="74" cy="306" r="12" fill={C.sage} />
    </Svg>
  );
}
