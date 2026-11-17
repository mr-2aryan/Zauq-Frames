import { Link } from 'react-router';
import { SparkleIcon, WhatsAppIcon } from '@/components/icons';
import { Container } from '@/components/ui';
import { UTILITY_NAV } from '@/config/navigation';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatPrice } from '@/utils/formatPrice';
import styles from './TopBar.module.css';

/** Dark strip above the header: WhatsApp, the current promotion (from the API) and help links. */
export function TopBar() {
  const { catalog } = useCatalog();

  const messages = catalog
    ? [
        catalog.promotion.percentOff > 0 ? `${catalog.promotion.label} this month` : null,
        `Flat ${formatPrice(catalog.deliveryFee, catalog.currency)} delivery across Pakistan`,
      ].filter(Boolean)
    : ['Framed wall art, made to order in Pakistan'];

  return (
    <div className={styles.bar}>
      <Container className={styles.inner}>
        <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.contact}>
          <WhatsAppIcon size={15} />
          {SITE.phone.display}
        </a>

        <p className={styles.message}>
          <SparkleIcon size={11} className={styles.sparkle} />
          {messages.join('  ·  ')}
        </p>

        <ul className={styles.links}>
          {UTILITY_NAV.map((item) => (
            <li key={item.to}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
