import { ArrowRightIcon, BoxIcon, BrushIcon, TruckIcon, WhatsAppIcon } from '@/components/icons';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';
import styles from './TrustStrip.module.css';

/** Four reasons to buy, in a wide band above the footer on every page (rendered by MainLayout). */
export function TrustStrip({ className }) {
  const { catalog } = useCatalog();
  const deliveryFee = catalog ? formatPrice(catalog.deliveryFee, catalog.currency) : null;

  const items = [
    {
      Icon: BrushIcon,
      title: 'Made to order',
      text: 'Every frame is printed and finished by hand in Rawalpindi once you order — nothing sits in a warehouse.',
      meta: `Delivered in ${SITE.leadTime}`,
    },
    {
      Icon: BoxIcon,
      title: 'Packed securely',
      text: 'Wrapped and boxed to travel safely across Pakistan. If anything arrives damaged, we put it right.',
      meta: 'Damage covered',
    },
    {
      Icon: TruckIcon,
      title: deliveryFee ? `${deliveryFee} delivery` : 'Nationwide delivery',
      text: 'One flat delivery fee to any city in Pakistan, however many frames are in your order.',
      meta: 'Every city, one rate',
    },
    {
      Icon: WhatsAppIcon,
      title: 'WhatsApp support',
      text: 'Questions about sizes, a custom photo or your order? Message us and we’ll help you choose.',
      meta: SITE.hours,
      link: { label: 'Chat now', href: SITE.whatsappUrl },
    },
  ];

  return (
    <section aria-label="Why shop with Zauq" className={cn(styles.band, className)}>
      <ul className={styles.strip}>
        {items.map(({ Icon, title, text, meta, link }, index) => (
          <li key={title} className={styles.item} data-reveal="fade-up" style={{ '--reveal-delay': `${index * 80}ms` }}>
            <span className={styles.icon} aria-hidden="true">
              <Icon size={26} />
            </span>
            <strong className={styles.title}>{title}</strong>
            <p className={styles.text}>{text}</p>
            <span className={styles.meta}>
              {meta}
              {link && (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {link.label} <ArrowRightIcon size={15} />
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
