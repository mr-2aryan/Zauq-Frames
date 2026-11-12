const numberFormat = new Intl.NumberFormat('en-US');

/**
 * Formats a price for display. PKR uses the local "Rs 1,500" style.
 * @param {number} amount
 * @param {string} [currency='PKR']
 */
export function formatPrice(amount, currency = 'PKR') {
  if (currency === 'PKR') return `Rs ${numberFormat.format(amount)}`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
