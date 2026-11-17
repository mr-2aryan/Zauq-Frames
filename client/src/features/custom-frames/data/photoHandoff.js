/**
 * A photo the customer picked outside the builder (the home page preview),
 * waiting for the frame builder to pick it up. Kept in memory only, so it
 * survives client-side navigation but never a reload.
 *
 * @typedef {{ file: File, sizeId: string, orientation: 'portrait' | 'landscape', crop: { x: number, y: number } }} HandedOffPhoto
 */

/** @type {HandedOffPhoto | null} */
let pending = null;

/** @param {HandedOffPhoto} choice */
export function handOffPhoto(choice) {
  pending = choice;
}

/** @returns {HandedOffPhoto | null} */
export function peekHandedOffPhoto() {
  return pending;
}

export function clearHandedOffPhoto() {
  pending = null;
}
