/** Pixels per inch for the "Sizes, to scale" drawing. */
export const SCALE_PX_PER_INCH = 9;

/** Live preview sizing: the long side is `BASE + inches × PER_INCH` pixels. */
const PREVIEW_BASE_PX = 240;
const PREVIEW_PX_PER_INCH = 7;

/**
 * Width (px) and CSS aspect-ratio of the live preview frame.
 * Catalogue sizes are stored portrait-first (height is the long side).
 *
 * @param {{ width: number, height: number }} size
 * @param {'portrait' | 'landscape'} orientation
 */
export function getPreviewGeometry({ width, height }, orientation) {
  const longSide = PREVIEW_BASE_PX + height * PREVIEW_PX_PER_INCH;
  const isPortrait = orientation === 'portrait';
  return {
    width: isPortrait ? Math.round((longSide * width) / height) : longSide,
    aspectRatio: isPortrait ? `${width} / ${height}` : `${height} / ${width}`,
  };
}
