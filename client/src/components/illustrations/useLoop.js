import { useEffect, useRef, useState } from 'react';

/**
 * For the looping hero scenes: a `ref` for the scene, a `cycle` count that goes
 * up every `ms` while it's on screen (key the animated parts on it to replay
 * them), whether it's `running`, and `still` when the visitor prefers reduced
 * motion (show the finished state instead).
 * @param {number} ms
 */
export function useLoop(ms) {
  const ref = useRef(null);
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [onScreen, setOnScreen] = useState(true);
  const [cycle, setCycle] = useState(0);
  const running = !still && onScreen;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setCycle((value) => value + 1), ms);
    return () => window.clearInterval(timer);
  }, [running, ms]);

  return { ref, cycle, running, still };
}
