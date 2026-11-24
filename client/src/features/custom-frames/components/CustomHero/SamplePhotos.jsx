/**
 * Three illustrated "photos" for the hero's demo: a sunset over hills, a city
 * at night and a day at the beach. Drawn in code (no real people or places),
 * they fill whatever box they're given, like a photo with object-fit: cover.
 */

function Sunset({ id }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a3b69" />
          <stop offset="0.45" stopColor="#e0645a" />
          <stop offset="0.8" stopColor="#f6b26b" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill={`url(#${id}sky)`} />
      <circle cx="150" cy="178" r="42" fill="#ffd58a" />
      <path d="M0 200 Q 70 150 140 196 T 300 180 V300 H0 Z" fill="#8a7a45" />
      <path d="M0 230 Q 90 190 170 226 T 300 214 V300 H0 Z" fill="#5d6b34" />
      <path d="M0 262 Q 110 232 200 262 T 300 252 V300 H0 Z" fill="#3a4520" />
      <g fill="none" stroke="#3b2335" strokeWidth="2.2" strokeLinecap="round">
        <path d="M86 84 q6 -6 12 0 q6 -6 12 0" />
        <path d="M120 64 q5 -5 10 0 q5 -5 10 0" />
        <path d="M200 96 q5 -5 10 0 q5 -5 10 0" />
      </g>
    </>
  );
}

function Skyline({ id }) {
  const buildings = [
    [0, 170, 40],
    [36, 140, 34],
    [66, 186, 30],
    [92, 118, 42],
    [130, 160, 28],
    [154, 132, 38],
    [188, 176, 30],
    [214, 104, 40],
    [250, 150, 50],
  ];
  return (
    <>
      <defs>
        <linearGradient id={`${id}night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141c33" />
          <stop offset="1" stopColor="#35496f" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill={`url(#${id}night)`} />
      <g fill="#f3efe0">
        {[
          [30, 30],
          [74, 58],
          [120, 24],
          [168, 48],
          [256, 36],
          [210, 70],
          [46, 90],
          [280, 92],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />
        ))}
      </g>
      <circle cx="236" cy="58" r="20" fill="#f6e7b4" />
      <circle cx="245" cy="51" r="18" fill="#1a2440" />
      {buildings.map(([x, top, w]) => (
        <g key={x}>
          <rect x={x} y={top} width={w} height={232 - top} fill="#0f1528" />
          {Array.from({ length: Math.floor((226 - top) / 16) }, (_, row) =>
            Array.from({ length: Math.floor(w / 12) }, (_, col) =>
              (row + col + x) % 3 === 0 ? null : <rect key={`${row}-${col}`} x={x + 5 + col * 12} y={top + 8 + row * 16} width="5" height="7" fill="#f2c96b" opacity="0.85" />,
            ),
          )}
        </g>
      ))}
      <rect y="232" width="300" height="68" fill="#1c2a47" />
      <g fill="#f2c96b" opacity="0.35">
        <rect x="100" y="240" width="18" height="3" />
        <rect x="160" y="250" width="26" height="3" />
        <rect x="224" y="244" width="20" height="3" />
        <rect x="40" y="256" width="22" height="3" />
      </g>
    </>
  );
}

function Beach({ id }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}day`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fcde4" />
          <stop offset="1" stopColor="#f5e6c4" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill={`url(#${id}day)`} />
      <circle cx="226" cy="74" r="30" fill="#fff2b8" />
      <path d="M0 150 H300 V214 H0 Z" fill="#2f86ad" />
      <g fill="none" stroke="#e8f6fb" strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <path d="M20 172 q12 -6 24 0 t24 0" />
        <path d="M150 186 q12 -6 24 0 t24 0" />
        <path d="M230 166 q10 -5 20 0 t20 0" />
      </g>
      <path d="M0 210 Q 150 196 300 214 V300 H0 Z" fill="#e9d3a5" />
      <path d="M0 214 Q 150 200 300 218" fill="none" stroke="#fbf6ea" strokeWidth="4" opacity="0.8" />
      <g>
        <path d="M96 166 L136 166 L130 176 L102 176 Z" fill="#7a4b2a" />
        <path d="M116 130 L116 166 L136 160 Z" fill="#fbfaf6" />
        <rect x="115" y="128" width="2" height="38" fill="#5a3a22" />
      </g>
    </>
  );
}

/* Simpler scenes for the rest of the phone's gallery. */

function Lake() {
  return (
    <>
      <rect width="300" height="300" fill="#cfe5ec" />
      <path d="M0 170 L70 90 L120 150 L170 70 L240 160 L300 110 V200 H0 Z" fill="#7f93a3" />
      <path d="M150 70 L170 70 L160 82 Z" fill="#f4f6f7" />
      <rect y="196" width="300" height="104" fill="#5f90a8" />
      <path d="M40 230 h60 M160 252 h80" stroke="#cfe5ec" strokeWidth="3" />
    </>
  );
}

function Dunes() {
  return (
    <>
      <rect width="300" height="300" fill="#f6d9a9" />
      <circle cx="80" cy="80" r="30" fill="#fff0c8" />
      <path d="M0 190 Q 90 130 180 190 T 300 170 V300 H0 Z" fill="#dea062" />
      <path d="M0 240 Q 120 190 220 240 T 300 230 V300 H0 Z" fill="#c27d43" />
    </>
  );
}

function Forest() {
  return (
    <>
      <rect width="300" height="300" fill="#e4eedc" />
      {[20, 70, 120, 170, 220, 270].map((x, index) => (
        <path key={x} d={`M${x} ${90 + (index % 2) * 30} L${x + 40} 260 H${x - 40} Z`} fill={index % 2 ? '#4f6b3a' : '#3c5530'} />
      ))}
      <rect y="250" width="300" height="50" fill="#6e8a4a" />
    </>
  );
}

function Flowers() {
  return (
    <>
      <rect width="300" height="300" fill="#f5e7ea" />
      {[
        [60, 120, '#e07a8f'],
        [150, 90, '#f2c14e'],
        [230, 140, '#e07a8f'],
        [110, 190, '#c8643b'],
        [200, 220, '#f2c14e'],
      ].map(([x, y, color]) => (
        <g key={`${x}-${y}`}>
          <rect x={x - 2} y={y} width="4" height={300 - y} fill="#6f8a3a" />
          <circle cx={x} cy={y} r="24" fill={color} />
          <circle cx={x} cy={y} r="8" fill="#fff4d6" />
        </g>
      ))}
    </>
  );
}

function Snow() {
  return (
    <>
      <rect width="300" height="300" fill="#d5e3f1" />
      <path d="M0 220 L90 80 L160 180 L220 100 L300 210 V300 H0 Z" fill="#9fb3c8" />
      <path d="M90 80 L115 118 L100 112 L84 122 L68 106 Z M220 100 L240 130 L226 126 L210 134 L200 128 Z" fill="#ffffff" />
      <rect y="240" width="300" height="60" fill="#f4f7fa" />
    </>
  );
}

function Autumn() {
  return (
    <>
      <rect width="300" height="300" fill="#f7e5c6" />
      <rect x="140" y="150" width="20" height="120" fill="#6b4a2f" />
      <circle cx="150" cy="120" r="70" fill="#d97b2b" />
      <circle cx="110" cy="140" r="40" fill="#c8643b" />
      <circle cx="195" cy="135" r="42" fill="#e3a23c" />
      <rect y="262" width="300" height="38" fill="#cf9a52" />
    </>
  );
}

const SCENES = { sunset: Sunset, skyline: Skyline, beach: Beach, lake: Lake, dunes: Dunes, forest: Forest, flowers: Flowers, snow: Snow, autumn: Autumn };


/**
 * @param {{ name: keyof typeof SCENES, id: string, className?: string }} props
 */
export function SamplePhoto({ name, id, className }) {
  const Scene = SCENES[name];
  return (
    <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <Scene id={id} />
    </svg>
  );
}
