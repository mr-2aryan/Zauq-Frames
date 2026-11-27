/** Formatting shared by every admin page (Pakistan time, PKR). */
const TZ = 'Asia/Karachi';

export const money = (amount) => (amount == null ? '—' : `Rs ${Number(amount).toLocaleString('en-PK')}`);

export const date = (iso) => (iso ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ }).format(new Date(iso)) : '—');

export const dateTime = (iso) =>
  iso ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: TZ }).format(new Date(iso)) : '—';

export function ago(iso) {
  if (!iso) return '—';
  const seconds = Math.round((Date.now() - Date.parse(iso)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days} d ago` : date(iso);
}

/** Order statuses: label and chip colour. */
export const ORDER_STATUS = {
  pending: { label: 'Order placed', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'info' },
  in_production: { label: 'Printing & framing', color: 'secondary' },
  shipped: { label: 'Shipped', color: 'primary' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'default' },
};
export const ORDER_STATUS_KEYS = Object.keys(ORDER_STATUS);

export const PAYMENT_METHOD = { cod: 'Cash on delivery', bank: 'Bank / JazzCash / Easypaisa' };

/** A phone number as a WhatsApp chat link (Pakistan numbers). */
export function whatsapp(phone, text = '') {
  const digits = String(phone ?? '').replace(/\D/g, '');
  const intl = digits.startsWith('92') ? digits : digits.startsWith('0') ? `92${digits.slice(1)}` : `92${digits}`;
  return `https://wa.me/${intl}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** The shop's address, for "view on site" links. */
export const SHOP_URL = import.meta.env.VITE_SHOP_URL || (location.hostname.startsWith('admin.') ? `${location.protocol}//${location.hostname.slice(6)}` : 'http://localhost:5173');
