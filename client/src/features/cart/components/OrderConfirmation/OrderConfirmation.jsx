import { useId } from 'react';
import { CheckCircleIcon, WhatsAppIcon } from '@/components/icons';
import { Button, Panel } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import { formatPrice } from '@/utils/formatPrice';
import styles from './OrderConfirmation.module.css';

/**
 * Shown after an order is placed.
 * @param {{ order: { id: string, total: number, currency: string, items: Array<{ quantity: number }>, customer: { name: string } } }} props
 */
export function OrderConfirmation({ order }) {
  const headingId = useId();
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const firstName = order.customer.name.split(' ')[0];

  return (
    <Panel tone="tint" className={styles.panel} aria-labelledby={headingId} role="status">
      <CheckCircleIcon size={48} className={styles.icon} />
      <h1 id={headingId} className={styles.title}>
        Thank you, {firstName}!
      </h1>
      <p className={styles.text}>
        Your order <strong>{order.id}</strong> for {itemCount} {itemCount === 1 ? 'frame' : 'frames'} ({formatPrice(order.total, order.currency)}) has been
        received. We’ll call or WhatsApp you shortly to confirm the details and payment. Frames are ready in {SITE.leadTime}.
      </p>
      <div className={styles.actions}>
        <Button href={whatsappLink(`Hi Zauq, I just placed order ${order.id}.`)} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={18} /> Message us on WhatsApp
        </Button>
        <Button to={ROUTES.shop} variant="secondary">
          Continue shopping
        </Button>
      </div>
      <p className={styles.small}>Keep your order number — you’ll need it to track your order.</p>
    </Panel>
  );
}
