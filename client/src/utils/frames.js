/**
 * `8 × 10` or, with `unit`, `8 × 10 in`.
 * @param {{ width: number, height: number }} size
 */
export function formatSizeLabel({ width, height }, { unit = false } = {}) {
  return `${width} × ${height}${unit ? ' in' : ''}`;
}

/** `'portrait'` → `'Portrait'` */
export const formatOrientation = (orientation) => orientation.charAt(0).toUpperCase() + orientation.slice(1);

/** Size in centimetres, rounded: `20 × 25 cm`. */
export const formatSizeCm = ({ width, height }) => `${Math.round(width * 2.54)} × ${Math.round(height * 2.54)} cm`;
