/**
 * Zauq admin design tokens: the glass system.
 *
 * Surfaces are frosted glass over a soft mesh of the brand colours (see `mesh`).
 * Use the levels in order of height: `glass.card` for content, `glass.raised` for
 * bars, menus and popovers, `glass.dialog` for modals, `glass.dark` for the
 * sidebar and tooltips, `glass.well` for areas set into a card (message text,
 * image tiles). Motion uses `motion.*`; every animation is switched off for
 * people who ask for reduced motion.
 */

export const color = {
  olive900: '#1f2610',
  olive800: '#2c3417',
  olive700: '#3e4a1f', // primary
  olive600: '#4b5a26',
  olive500: '#5c6b33',
  olive300: '#a9b48a',
  olive100: '#e4e8d2',
  terracotta: '#c8643b',
  terracottaDark: '#a44d2a',
  brass: '#c9a45c',
  cream: '#f4f3ee',
  canvas: '#ecebe3',
  ink: '#1c1f17',
  inkMuted: '#555a4b', // 6:1 on card glass
  inkFaint: '#7d8172', // for non-essential text only
  success: '#4f7a2a',
  warning: '#a8701c', // dark enough to read as text
  error: '#b3402a',
  info: '#3d6a8a',
  line: 'rgba(38, 44, 20, 0.09)',
  lineStrong: 'rgba(38, 44, 20, 0.16)',
};

export const radius = { xs: 8, sm: 11, md: 14, lg: 20, xl: 24 };

export const shadow = {
  highlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.75)',
  sm: '0 1px 2px rgba(31, 38, 16, 0.05), 0 10px 28px -14px rgba(31, 38, 16, 0.22)',
  md: '0 2px 6px rgba(31, 38, 16, 0.07), 0 22px 44px -18px rgba(31, 38, 16, 0.32)',
  lg: '0 4px 12px rgba(31, 38, 16, 0.08), 0 40px 90px -24px rgba(31, 38, 16, 0.42)',
  focus: '0 0 0 3px rgba(62, 74, 31, 0.28)',
};

export const motion = {
  fast: '140ms',
  base: '220ms',
  slow: '380ms',
  ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
};
export const transition = (...props) => props.map((p) => `${p} ${motion.base} ${motion.ease}`).join(', ');

const frost = (blur) => ({ backdropFilter: `blur(${blur}px) saturate(165%)`, WebkitBackdropFilter: `blur(${blur}px) saturate(165%)` });

/** Glass surfaces, from lowest to highest. Spread into `sx`. */
export const glass = {
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    ...frost(22),
    border: '1px solid rgba(255, 255, 255, 0.72)',
    boxShadow: `${shadow.highlight}, ${shadow.sm}`,
  },
  raised: {
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    ...frost(28),
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: `${shadow.highlight}, ${shadow.md}`,
  },
  dialog: {
    backgroundColor: 'rgba(250, 250, 246, 0.86)',
    ...frost(34),
    border: '1px solid rgba(255, 255, 255, 0.85)',
    boxShadow: `${shadow.highlight}, ${shadow.lg}`,
  },
  dark: {
    backgroundColor: 'rgba(29, 35, 15, 0.8)',
    ...frost(26),
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.07), ${shadow.md}`,
  },
  well: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    border: `1px solid ${color.line}`,
  },
};

/** The brand-colour mesh everything floats over. */
export const mesh = [
  `radial-gradient(38% 46% at 6% 4%, rgba(92, 107, 51, 0.62), transparent 70%)`,
  `radial-gradient(32% 40% at 96% 8%, rgba(201, 164, 92, 0.55), transparent 70%)`,
  `radial-gradient(42% 50% at 88% 96%, rgba(200, 100, 59, 0.4), transparent 72%)`,
  `radial-gradient(40% 48% at 18% 92%, rgba(169, 180, 138, 0.62), transparent 70%)`,
  `radial-gradient(30% 36% at 55% 45%, rgba(244, 243, 238, 0.7), transparent 75%)`,
].join(', ');

/** A fine grain over the mesh, so the glass has something to catch. */
export const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.12 0 0 0 0 0.14 0 0 0 0 0.06 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const font = {
  display: "'Bricolage Grotesque', 'Urbanist', system-ui, sans-serif",
  body: "'Urbanist', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
};
