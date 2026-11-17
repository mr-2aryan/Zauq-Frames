import { C } from './palette.js';
import { Svg } from './Svg.jsx';

/** An open shipping box with a framed print standing inside, corners protected. */
export function PackageBox({ className }) {
  return (
    <Svg className={className}>
      <rect x="20" y="24" width="440" height="352" rx="36" fill={C.cream} />
      <ellipse cx="240" cy="342" rx="170" ry="16" fill={C.sage} opacity="0.7" />
      {/* Frame inside */}
      <rect x="168" y="70" width="144" height="180" rx="3" fill={C.frame} />
      <rect x="178" y="80" width="124" height="160" fill={C.tint} />
      <circle cx="270" cy="118" r="16" fill={C.accent} />
      <path d="M178 210 L218 160 L246 190 L272 164 L302 202 V240 H178 Z" fill={C.olive} />
      {/* Corner protectors */}
      <path d="M160 62 h34 v12 h-22 v22 h-12 Z M320 62 h-34 v12 h22 v22 h12 Z" fill={C.accent} />
      {/* Box */}
      <path d="M110 200 L240 232 L370 200 L370 326 L240 344 L110 326 Z" fill={C.sand} />
      <path d="M240 232 V344" stroke="#D6C7A6" strokeWidth="3" />
      <path d="M110 200 L240 232 L200 262 L72 228 Z" fill="#E2D3B2" />
      <path d="M370 200 L240 232 L280 262 L408 228 Z" fill="#E2D3B2" />
      {/* Tape and arrows */}
      <rect x="146" y="276" width="56" height="12" rx="2" fill={C.olive} transform="rotate(10 174 282)" />
      <path d="M302 280 v28 M292 290 l10 -10 l10 10 M326 280 v28 M316 290 l10 -10 l10 10" stroke={C.olive} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
