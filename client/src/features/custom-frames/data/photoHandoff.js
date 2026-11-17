/**
 * A photo the customer picked outside the builder (the home page preview, or
 * the custom frames hero), waiting for the frame builder to pick it up. Kept in
 * memory only, so it survives client-side navigation but never a reload.
 * A builder that's already on screen is told straight away.
 *
 * @typedef {{ file: File, sizeId?: string, orientation: 'portrait' | 'landscape', crop: { x: number, y: number } }} HandedOffPhoto
 */

/** @type {HandedOffPhoto | null} */
let pending = null;
/** @type {Set<(choice: HandedOffPhoto) => void>} */
const listeners = new Set();

/** @param {HandedOffPhoto} choice */
export function handOffPhoto(choice) {
  pending = choice;
  listeners.forEach((listener) => listener(choice));
}

/** Calls `listener` for each later hand-off; returns the unsubscribe function. */
export function onPhotoHandedOff(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** @returns {HandedOffPhoto | null} */
export function peekHandedOffPhoto() {
  return pending;
}

export function clearHandedOffPhoto() {
  pending = null;
}
