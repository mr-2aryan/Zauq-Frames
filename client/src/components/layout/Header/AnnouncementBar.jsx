import { useCatalog } from '@/context/catalog/useCatalog';
import { formatPrice } from '@/utils/formatPrice';
import styles from './AnnouncementBar.module.css';

/** Olive strip at the top of every page: current promotion and delivery fee from the API. */
export function AnnouncementBar() {
  const { catalog } = useCatalog();

  const messages = catalog
    ? [
        catalog.promotion.percentOff > 0 ? `${catalog.promotion.label} this month` : null,
        `Flat ${formatPrice(catalog.deliveryFee, catalog.currency)} delivery across Pakistan`,
      ].filter(Boolean)
    : ['Framed wall art, made to order in Pakistan'];

  return (
    <div className={styles.bar}>
      <p className={styles.text}>{messages.join('  ·  ')}</p>
    </div>
  );
}
