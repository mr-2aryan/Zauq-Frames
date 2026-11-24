const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/**
 * A small count as a word: `countWord(6)` → 'six', `countWord(6, { capital: true })` → 'Six'.
 * Counts above twelve stay as digits.
 * @param {number} count
 * @param {{ capital?: boolean }} [options]
 */
export function countWord(count, { capital = false } = {}) {
  const word = WORDS[count] ?? String(count);
  return capital ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}
