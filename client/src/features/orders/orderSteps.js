import { BagIcon, BrushIcon, CheckCircleIcon, HangIcon, TruckIcon } from '@/components/icons';
import { SITE } from '@/config/site';

/**
 * The five stages of an order, in order. `status` matches the server's
 * ORDER_STATUS values (orders.service.js); a cancelled order stops wherever it was.
 */
export const ORDER_STEPS = Object.freeze([
  { status: 'pending', label: 'Order placed', description: 'We’ve received your order.', Icon: BagIcon },
  { status: 'confirmed', label: 'Confirmed', description: 'We’ve confirmed the details and payment with you by call or WhatsApp.', Icon: CheckCircleIcon },
  { status: 'in_production', label: 'Printing & framing', description: 'Your piece is printed and framed by hand in Rawalpindi.', Icon: BrushIcon },
  { status: 'shipped', label: 'Shipped', description: `On its way with our courier — usually ${SITE.shippingTime}.`, Icon: TruckIcon },
  { status: 'delivered', label: 'Delivered', description: 'At your door, ready to hang.', Icon: HangIcon },
]);

const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const dayParts = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

/** `17 Nov` */
export const formatDay = (iso) => day.format(new Date(iso));

/** `24–27 Nov`, or `29 Nov – 2 Dec` across months. */
export function formatDayRange(fromIso, toIso) {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  if (from.getMonth() === to.getMonth()) return `${from.getDate()}–${dayParts.format(to)}`;
  return `${dayParts.format(from)} – ${dayParts.format(to)}`;
}
