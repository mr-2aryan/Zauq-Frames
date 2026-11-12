import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Scrolls to `#id` after client-side navigation (e.g. a link to `/#business`),
 * which the browser does not do by itself in a single-page app.
 */
export function useScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    // Wait a frame so the new page has rendered its sections.
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);
}
