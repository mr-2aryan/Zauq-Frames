import { useCallback, useRef, useState } from 'react';

const CENTER = Object.freeze({ x: 50, y: 50 });
const KEY_STEP = 2;
const KEY_STEP_LARGE = 10;

const clampPercent = (value) => Math.min(100, Math.max(0, value));

/**
 * How far (px) the cover-fitted image overflows the frame on each axis.
 * Only an overflowing axis can be repositioned.
 * @param {HTMLElement} frame
 */
function measureOverflow(frame) {
  const image = frame.querySelector('img');
  if (!image?.naturalWidth) return { x: 0, y: 0 };

  const { clientWidth: frameWidth, clientHeight: frameHeight } = frame;
  const scale = Math.max(frameWidth / image.naturalWidth, frameHeight / image.naturalHeight);
  return {
    x: image.naturalWidth * scale - frameWidth,
    y: image.naturalHeight * scale - frameHeight,
  };
}

/**
 * Lets the customer drag (or arrow-key) the photo inside the frame.
 * The position is a CSS `object-position` in percent and resets whenever
 * `resetKey` (e.g. the photo URL) changes.
 */
export function useCropPosition(resetKey) {
  const [position, setPosition] = useState(CENTER);
  const [trackedKey, setTrackedKey] = useState(resetKey);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  // Reset during render when the photo changes (avoids an extra effect pass).
  if (resetKey !== trackedKey) {
    setTrackedKey(resetKey);
    setPosition(CENTER);
  }

  const onPointerDown = useCallback(
    (event) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        origin: position,
        overflow: measureOverflow(event.currentTarget),
      };
      setIsDragging(true);
    },
    [position],
  );

  const onPointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag) return;

    // Dragging right reveals more of the left side, so the percentage goes down.
    const shift = (delta, overflow, origin) => (overflow > 0 ? clampPercent(origin - (delta / overflow) * 100) : origin);

    setPosition({
      x: shift(event.clientX - drag.startX, drag.overflow.x, drag.origin.x),
      y: shift(event.clientY - drag.startY, drag.overflow.y, drag.origin.y),
    });
  }, []);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Home') {
      event.preventDefault();
      setPosition(CENTER);
      return;
    }

    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const moves = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;

    event.preventDefault();
    setPosition((current) => ({ x: clampPercent(current.x + move[0]), y: clampPercent(current.y + move[1]) }));
  }, []);

  return {
    position,
    isDragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown,
    },
  };
}
