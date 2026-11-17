import { C } from './palette.js';
import { Svg } from './Svg.jsx';

/** A calendar page with a highlighted run of days — order to door. */
export function CalendarIllustration({ className }) {
  const cells = Array.from({ length: 28 }, (_, i) => i);
  return (
    <Svg className={className}>
      <rect x="20" y="24" width="440" height="352" rx="36" fill={C.cream} />
      <rect x="96" y="70" width="288" height="262" rx="18" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <path d="M96 88 a18 18 0 0 1 18 -18 h252 a18 18 0 0 1 18 18 v36 h-288 Z" fill={C.olive} />
      <rect x="148" y="52" width="12" height="36" rx="6" fill={C.dark} />
      <rect x="320" y="52" width="12" height="36" rx="6" fill={C.dark} />
      {cells.map((i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const x = 116 + col * 37;
        const y = 142 + row * 44;
        const inRange = i >= 9 && i <= 18;
        return <rect key={i} x={x} y={y} width="28" height="28" rx="8" fill={i === 9 ? C.olive : i === 18 ? C.accent : inRange ? C.sage : C.tint} />;
      })}
      {/* A small framed parcel flag on the last day */}
      <rect x="392" y="226" width="54" height="70" rx="3" fill={C.frame} />
      <rect x="398" y="232" width="42" height="58" fill={C.tint} />
      <circle cx="426" cy="248" r="6" fill={C.accent} />
      <path d="M398 280 L414 262 L426 274 L440 260 V290 H398 Z" fill={C.oliveSoft} />
    </Svg>
  );
}
