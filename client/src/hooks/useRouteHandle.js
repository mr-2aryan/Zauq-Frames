import { useMatches } from 'react-router';

/**
 * Reads a value from the deepest matched route's `handle`.
 * Routes declare e.g. `handle: { section: 'Custom Frames', title: 'Custom Frames' }`.
 */
export function useRouteHandle(key, fallback) {
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const value = matches[i].handle?.[key];
    if (value !== undefined) return value;
  }
  return fallback;
}
