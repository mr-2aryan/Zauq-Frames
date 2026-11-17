/**
 * The order just placed, kept for this browser tab so the confirmation page can
 * show the delivery address and payment choice (the public order lookup hides
 * contact details). Storage can be unavailable (private mode), so every access
 * is guarded and the page still works from the server's copy.
 */
const KEY = 'zauq:last-order';

export function saveLastOrder(order, customer) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ order, customer }));
  } catch {
    /* storage unavailable */
  }
}

/** @returns {{ order: object, customer: object } | null} the saved order, if it's the one asked for. */
export function readLastOrder(orderId) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    return saved?.order?.id === orderId ? saved : null;
  } catch {
    return null;
  }
}
