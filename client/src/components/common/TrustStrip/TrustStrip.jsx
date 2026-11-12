import { BoxIcon, BrushIcon, TruckIcon, WhatsAppIcon } from '@/components/icons';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';
import styles from './TrustStrip.module.css';

/** Four short reasons to buy, shown near the bottom of key pages. */
export function TrustStrip({ className }) {
  const { catalog } = useCatalog();
  const delivery = catalog ? `${formatPrice(catalog.deliveryFee, catalog.currency)} delivery` : 'Nationwide delivery';

  const items = [
    { Icon: BrushIcon, title: 'Made to order', text: 'Finished by hand in Rawalpindi' },
    { Icon: BoxIcon, title: 'Packed securely', text: 'Safe across Pakistan' },
    { Icon: TruckIcon, title: delivery, text: 'Flat rate, any city' },
    { Icon: WhatsAppIcon, title: 'WhatsApp support', text: SITE.hours },
  ];

  return (
    <ul className={cn(styles.strip, className)} aria-label="Why shop with Zauq">
      {items.map(({ Icon, title, text }) => (
        <li key={title} className={styles.item}>
          <Icon size={26} className={styles.icon} />
          <span>
            <strong className={styles.title}>{title}</strong>
            <span className={styles.text}>{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
