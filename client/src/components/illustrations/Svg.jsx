/**
 * Shared wrapper for the flat illustrations: decorative (aria-hidden), and
 * scales to its container's width.
 * @param {{ viewBox?: string, className?: string, children: import('react').ReactNode }} props
 */
export function Svg({ viewBox = '0 0 480 400', className, children }) {
  return (
    <svg viewBox={viewBox} width="100%" style={{ height: 'auto', display: 'block' }} fill="none" aria-hidden="true" focusable="false" className={className}>
      {children}
    </svg>
  );
}
