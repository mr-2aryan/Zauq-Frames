import { useId } from 'react';
import { CheckCircleIcon, GiftIcon, HotelIcon, MailIcon, OfficeIcon, WhatsAppIcon } from '@/components/icons';
import { Badge, Button, Panel, Section } from '@/components/ui';
import { SITE, whatsappLink } from '@/config/site';
import styles from './BusinessSection.module.css';

const INCLUDED = [
  'Help choosing pieces and sizes',
  'Your logo or photos, framed to match',
  'Every file checked before printing',
  'Secure delivery to one office or many',
];

const OFFERS = [
  {
    Icon: OfficeIcon,
    title: 'Offices & receptions',
    text: 'Pieces chosen for your brand and sized for every wall.',
    suited: 'Head offices · Banks · Co-working',
  },
  {
    Icon: GiftIcon,
    title: 'Corporate gifting',
    text: 'Calligraphy and personalised frames that are kept long after the occasion.',
    suited: 'Ramadan · Eid · Client thank-yous',
  },
  {
    Icon: HotelIcon,
    title: 'Hotels, cafés & clinics',
    text: 'Matching sets that carry one mood across rooms and floors.',
    suited: 'Lobbies · Dining rooms · Waiting areas',
  },
];

/** "Zauq for business" — anchor target of the Business nav link. */
export function BusinessSection() {
  const headingId = useId();

  return (
    <Section id="business" aria-labelledby={headingId}>
      <Panel tone="tint" className={styles.panel}>
        <div className={styles.copy}>
          <Badge>For business</Badge>
          <h2 id={headingId} className={styles.title}>
            Framed art for offices, gifting and hospitality
          </h2>
          <p className={styles.lead}>
            From one statement piece for your reception to framed gifts for a whole team — curated with you, made to order and delivered
            anywhere in Pakistan. Every project is quoted individually.
          </p>

          <ul className={styles.included} aria-label="What businesses get">
            {INCLUDED.map((item) => (
              <li key={item}>
                <CheckCircleIcon size={20} />
                {item}
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Button href={whatsappLink('Hi Zauq, I’d like a quote for a business order.')} target="_blank" rel="noopener noreferrer" size="lg">
              <WhatsAppIcon size={19} /> Get a quote on WhatsApp
            </Button>
            <Button href={`mailto:${SITE.email}?subject=Business%20order`} variant="secondary" size="lg">
              <MailIcon size={19} /> Email us
            </Button>
          </div>
        </div>

        <div className={styles.media}>
          <img src="/images/products/square-kufic-room.jpg" alt="Square Kufic calligraphy framed in a modern office interior" className={styles.image} loading="lazy" />
          <div className={styles.note}>
            <strong>Quoted per project</strong>
            <span>Tell us the space, quantity and deadline</span>
          </div>
        </div>
      </Panel>

      <ul className={styles.offers}>
        {OFFERS.map(({ Icon, title, text, suited }) => (
          <li key={title} className={styles.offer}>
            <span className={styles.icon}>
              <Icon size={24} />
            </span>
            <div>
              <h3 className={styles.offerTitle}>{title}</h3>
              <p className={styles.offerText}>{text}</p>
              <p className={styles.suited}>{suited}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
