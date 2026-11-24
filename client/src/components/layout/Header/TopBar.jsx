import { Link } from 'react-router';
import { SparkleIcon, WhatsAppIcon } from '@/components/icons';
import { Container } from '@/components/ui';
import { UTILITY_NAV } from '@/config/navigation';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { cn } from '@/utils/cn';
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

        {/* Side by side where there is room; on a phone the two take turns on one line. */}
        <p className={cn(styles.message, messages.length === 2 && styles.rotating)}>
          {messages.map((message, index) => (
            <span key={message} className={styles.item} style={{ '--i': index }}>
              <SparkleIcon size={11} className={styles.sparkle} />
              {index > 0 && (
                <span className={styles.dot} aria-hidden="true">
                  ·
                </span>
              )}
              {message}
            </span>
          ))}
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
