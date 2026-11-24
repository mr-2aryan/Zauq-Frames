import { useId } from 'react';
import { WhatsAppIcon } from '@/components/icons';
import { whatsappLink } from '@/config/site';
import { cn } from '@/utils/cn';
import { formatOrientation, matSuffix } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import { formatDay, formatDayRange, ORDER_STEPS } from '../../orderSteps.js';
import { OrderTimeline } from '../OrderTimeline/OrderTimeline.jsx';
import styles from './TrackedOrder.module.css';

/**
 * One order's tracking card: number and status, when it should arrive, the
 * stage timeline and what's in it.
 * @param {{ order: {
 *   id: string, status: string, history: Array<{ status: string, at: string }>,
 *   placedAt: string, updatedAt: string, estimatedDelivery: { from: string, to: string },
 *   customer: { firstName: string, city: string },
 *   items: Array<{ type: string, name: string, label: string, orientation: string, quantity: number, image?: string }>,
 *   currency: string, total: number,
 * } }} props
 */
export function TrackedOrder({ order }) {
  const headingId = useId();
  const cancelled = order.status === 'cancelled';
  const delivered = order.status === 'delivered';
  const step = ORDER_STEPS.find((entry) => entry.status === order.status);
  const deliveredAt = order.history.find((entry) => entry.status === 'delivered')?.at;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className={styles.card} aria-labelledby={headingId} aria-live="polite">
      <header className={styles.head}>
        <div>
          <p className={styles.small}>Order</p>
          <h2 id={headingId} className={styles.id}>
            {order.id}
          </h2>
        </div>
        <span className={cn(styles.badge, cancelled && styles.badgeCancelled, delivered && styles.badgeDone)}>{cancelled ? 'Cancelled' : step?.label}</span>
      </header>

      <div className={styles.summary}>
        <div>
          <p className={styles.small}>{cancelled ? 'Status' : delivered ? 'Delivered' : 'Estimated delivery'}</p>
          <p className={styles.eta}>
            {cancelled ? 'This order was cancelled' : delivered && deliveredAt ? formatDay(deliveredAt) : formatDayRange(order.estimatedDelivery.from, order.estimatedDelivery.to)}
          </p>
        </div>
        <p className={styles.meta}>
          Placed {formatDay(order.placedAt)} · {itemCount} {itemCount === 1 ? 'frame' : 'frames'} · to {order.customer.city}
        </p>
      </div>

      {!cancelled && <OrderTimeline status={order.status} history={order.history} />}

      <ul className={styles.items}>
        {order.items.map((item, index) => (
          <li key={`${item.name}-${index}`} className={styles.item}>
            {item.image ? <img src={item.image} alt="" className={styles.thumb} /> : <span className={styles.thumb} aria-hidden="true" />}
            <span className={styles.itemText}>
              <strong>{item.name}</strong>
              <span>
                {item.label} · {formatOrientation(item.orientation)}
                {matSuffix(item.mat)}
              </span>
            </span>
            <span className={styles.qty}>× {item.quantity}</span>
          </li>
        ))}
      </ul>

      <footer className={styles.foot}>
        <span>
          Total <strong>{formatPrice(order.total, order.currency)}</strong>
        </span>
        <a href={whatsappLink(`Hi Zauq, I have a question about order ${order.id}.`)} target="_blank" rel="noopener noreferrer" className={styles.help}>
          <WhatsAppIcon size={17} /> Questions about this order?
        </a>
      </footer>
    </article>
  );
}
