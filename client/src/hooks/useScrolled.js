import { useSyncExternalStore } from 'react';

const subscribe = (onChange) => {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
};

/** True once the page has scrolled more than `offset` pixels. Only re-renders when that flips. */
export function useScrolled(offset = 0) {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > offset,
    () => false,
  );
}
