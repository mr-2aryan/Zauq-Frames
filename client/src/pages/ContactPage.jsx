import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRightIcon, FacebookIcon, InstagramIcon, MailIcon, WhatsAppIcon } from '@/components/icons';
import { Breadcrumbs, Container } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { ContactForm } from '@/features/contact/components/ContactForm/ContactForm.jsx';
import { cn } from '@/utils/cn';
import styles from './ContactPage.module.css';

const PhoneIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);

/**
 * Pins on three frames of the gallery wall in the hero photo (positions are %
 * of the square image); hovering or tapping one shows that frame's size.
 */
const FRAME_PINS = [
  { x: 46.5, y: 27, size: '18 × 24 in' },
  { x: 65, y: 51, size: '24 × 36 in' },
  { x: 84, y: 33, size: '18 × 24 in' },
];

/** /contact — a split hero (copy left, gallery-wall photo with frame-size pins right), then the message form. */
export default function ContactPage() {
  const [openPin, setOpenPin] = useState(null);
  const stageRef = useRef(null);

  // A tapped size label closes with Esc or a tap elsewhere.
  useEffect(() => {
    if (openPin === null) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpenPin(null);
    const onPointer = (event) => {
      if (!stageRef.current?.contains(event.target)) setOpenPin(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [openPin]);

  const channels = [
    { Icon: WhatsAppIcon, label: 'WhatsApp', value: SITE.phone.display, href: SITE.whatsappUrl, external: true },
    { Icon: PhoneIcon, label: 'Call us', value: SITE.phone.display, href: SITE.phone.href },
    { Icon: MailIcon, label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
  ];

  return (
    <>
      <title>{`Contact us | ${SITE.name}`}</title>
      <meta name="description" content={`Contact Zauq Frames about sizes, custom photo frames, an order or framing for a business — on WhatsApp, by phone or email, ${SITE.hours}.`} />

      <section className={styles.hero} aria-labelledby="contact-title">
        <div className={styles.copy}>
          <div className={styles.copyInner}>
          <Breadcrumbs items={[{ label: 'Home', to: ROUTES.home }, { label: 'Contact' }]} />
          <p className={styles.kicker} data-reveal="fade-up">
            Contact · Rawalpindi studio
          </p>
          <h1 id="contact-title" className={styles.title} data-reveal="fade-up" style={{ '--reveal-delay': '60ms' }}>
            Let’s find the right <span className={styles.light}>frames for your wall.</span>
          </h1>
          <p className={styles.lead} data-reveal="fade-up" style={{ '--reveal-delay': '120ms' }}>
            Choosing a size, framing a photo, checking on an order or furnishing a whole office — message us and a real person will help. Hover over the <span className={styles.plus}>+</span> on a frame to see its size.
          </p>
          <ul className={styles.channels} data-reveal="fade-up" style={{ '--reveal-delay': '180ms' }}>
            {channels.map(({ Icon, label, value, href, external }) => (
              <li key={label}>
                <a href={href} className={styles.channel} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  <span className={styles.channelIcon} aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <span className={styles.channelText}>
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          </div>
        </div>

        {/* The photo fills the right half; the pins share its square, so they stay on the frames however it's cropped. */}
        <div className={styles.media}>
          <img
            src="/images/contact/contact-hero.jpg"
            alt="A gallery wall of seven framed photographs above a grey sofa"
            className={styles.photo}
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
          <div ref={stageRef} className={styles.stage}>
            {FRAME_PINS.map((pin, index) => (
              <div key={index} className={cn(styles.spot, openPin === index && styles.spotOpen)} style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
                <button type="button" className={styles.pin} aria-label={`Frame size ${pin.size}`} onClick={() => setOpenPin(openPin === index ? null : index)}>
                  <span aria-hidden="true">+</span>
                </button>
                <span className={styles.sizeTag} aria-hidden="true">
                  {pin.size}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Container className={styles.body}>
        <div className={styles.layout}>
          <div data-reveal="fade-up">
            <ContactForm />
          </div>

          <aside className={styles.aside} data-reveal="fade-up" style={{ '--reveal-delay': '100ms' }}>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Visit &amp; hours</h2>
              <p>{SITE.address}</p>
              <p>{SITE.hours}</p>
            </div>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Quick answers</h2>
              <ul className={styles.quick}>
                <li>
                  <Link to={ROUTES.trackOrder}>
                    Track your order <ArrowRightIcon size={16} />
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.faqs}>
                    Frequently asked questions <ArrowRightIcon size={16} />
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.sizes}>
                    Frame sizes &amp; prices <ArrowRightIcon size={16} />
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.customFrames}>
                    Frame your own photo <ArrowRightIcon size={16} />
                  </Link>
                </li>
              </ul>
            </div>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Follow along</h2>
              <div className={styles.social}>
                <a href={SITE.instagram.href} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${SITE.instagram.handle}`}>
                  <InstagramIcon size={20} />
                </a>
                <a href={SITE.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FacebookIcon size={20} />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
