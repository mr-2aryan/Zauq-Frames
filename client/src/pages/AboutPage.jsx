import { Link } from 'react-router';
import { FaqList, PageHero } from '@/components/common';
import { ArchIcon, BrushIcon, CheckCircleIcon, HangIcon, ImageIcon, PaletteIcon, PenNibIcon, ShapesIcon, WhatsAppIcon } from '@/components/icons';
import { CtaBand, FactCards, FeatureGrid, InfoSection, SplitBlock, StepList } from '@/components/info';
import { FramedWall, Workbench } from '@/components/illustrations';
import { Button } from '@/components/ui';
import { collectionPath, ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatPrice } from '@/utils/formatPrice';
import styles from './AboutPage.module.css';

const COLLECTIONS = [
  { Icon: PenNibIcon, name: 'Islamic Calligraphy', text: 'Bismillah, Kufic and verses of reflection, set among traditional patterns and gold illumination.', to: collectionPath('islamic-calligraphy') },
  { Icon: ShapesIcon, name: 'Modern & Minimal', text: 'Soft, earthy palettes and contemporary shapes for calm, modern rooms.', to: collectionPath('modern-minimal') },
  { Icon: PaletteIcon, name: 'Art & Culture', text: 'Bold pieces inspired by street art, music, sport and film.', to: collectionPath('art-culture') },
  { Icon: ArchIcon, name: 'Heritage Pakistan', text: 'Pakistan’s landmarks drawn in fine sepia line work, in landscape frames.', to: collectionPath('heritage-pakistan') },
  { Icon: ImageIcon, name: 'Custom frames', text: 'Your own photo, previewed in every size before you order.', to: ROUTES.customFrames },
];

/** /about — the story behind Zauq Frames and how every piece is made. */
export default function AboutPage() {
  const { catalog } = useCatalog();
  const deliveryFee = catalog ? formatPrice(catalog.deliveryFee, catalog.currency) : null;
  const fromPrice = catalog ? formatPrice(Math.min(...catalog.sizes.map((size) => size.salePrice)), catalog.currency) : null;

  const faqs = [
    { question: 'Where are you based?', answer: `In ${SITE.address}. Every frame is printed and finished by hand there, then sent by courier to your door.` },
    {
      question: 'Do you deliver to my city?',
      answer: `Yes — we deliver to any city in Pakistan for one flat ${deliveryFee ?? 'delivery'} fee per order, however many frames are in it.`,
    },
    {
      question: 'How do I pay?',
      answer: 'Cash on delivery, or by bank transfer, JazzCash or Easypaisa — we send the details on WhatsApp after you order. We confirm every order by call or WhatsApp before we start making it.',
    },
    {
      question: 'Can I frame my own photo?',
      answer: (
        <>
          Yes. Upload it on <Link to={ROUTES.customFrames}>Custom frames</Link>, see it framed in all five sizes and order it like any other piece.
        </>
      ),
    },
  ];

  return (
    <>
      <title>{`Our story | ${SITE.name}`}</title>
      <meta name="description" content={`Zauq Frames makes framed wall art and custom photo frames to order in ${SITE.address}, delivered ready to hang across Pakistan.`} />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Our story' }]}
        kicker="Our story"
        title="Art for the walls"
        titleLight="of Pakistani homes."
        lead={`Zauq means taste. We started Zauq Frames in ${SITE.address} in ${SITE.foundedYear} to make beautiful, ready-to-hang framed art simple to order from anywhere in the country.`}
        actions={
          <>
            <Button to={ROUTES.shop} size="lg">
              Shop the collection
            </Button>
            <Button to={ROUTES.customFrames} variant="secondary" size="lg">
              Frame your photo
            </Button>
          </>
        }
        media={<FramedWall />}
      />

      <InfoSection kicker="At a glance" title="A small studio with a simple promise">
        <FactCards
          items={[
            { value: SITE.foundedYear, label: 'Founded', note: `In ${SITE.address}` },
            { value: '5 sizes', label: 'For every piece', note: '8 × 10 up to 24 × 36 in' },
            { value: deliveryFee ?? 'Flat fee', label: 'Delivery per order', note: 'To any city in Pakistan' },
            { value: SITE.leadTime, label: 'Order to door', note: `${SITE.shippingTime} of it with the courier` },
          ]}
        />
      </InfoSection>

      <InfoSection>
        <SplitBlock kicker="The name" title="Zauq: an eye for what’s beautiful" media={<Workbench />}>
          <p>
            <strong>Zauq</strong> is the Urdu word for taste — the instinct that tells you a room is finished, or that one piece of art belongs on one wall. It’s the feeling we
            want every frame to bring into a home.
          </p>
          <p>
            We keep things deliberately simple. Every artwork is offered in the same five sizes, from a small 8 × 10 for a desk or shelf to a statement 24 × 36 for a large
            wall, each in a black frame and{fromPrice ? ` starting from ${fromPrice}` : ''}. One clear price list, no add-ons and no guesswork.
          </p>
          <p>
            And nothing is made until you order it. Your frame is printed and finished by hand for you, packed securely and delivered ready to hang, with the hanging
            hardware already fitted.
          </p>
        </SplitBlock>
      </InfoSection>

      <InfoSection tone="surface" kicker="What we make" title="Five collections, one standard" lead="From sacred calligraphy to Pakistan’s landmarks — and your own photos — every piece is printed in high quality and framed the same careful way.">
        <ul className={styles.collections}>
          {COLLECTIONS.map(({ Icon, name, text, to }, index) => (
            <li key={name} data-reveal="fade-up" style={{ '--reveal-delay': `${index * 60}ms` }}>
              <Link to={to} className={styles.collection}>
                <span className={styles.collectionIcon} aria-hidden="true">
                  <Icon size={24} />
                </span>
                <strong>{name}</strong>
                <span>{text}</span>
                <span className={styles.collectionLink}>Explore →</span>
              </Link>
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection kicker="How it works" title="From your order to your wall">
        <div className={styles.twoCol}>
          <StepList
            steps={[
              { title: 'You choose', text: 'Pick a piece and a size — or upload your own photo and preview it in every size.' },
              { title: 'We confirm', text: 'We call or WhatsApp you to confirm the details and payment before we start making anything.' },
              { title: 'We print and frame', text: `Your piece is printed in high quality and finished by hand in our ${SITE.address} studio.` },
              { title: 'We pack and send', text: `It’s packed securely and handed to our courier — ${SITE.shippingTime} to your door.` },
              { title: 'You hang it', text: 'It arrives ready to hang, hardware fitted. All that’s left is choosing the wall.' },
            ]}
          />
          <aside className={styles.callout} data-reveal="fade-up">
            <p className={styles.calloutKicker}>Our promise</p>
            <p className={styles.calloutText}>If a frame ever arrives damaged or different from your order, message us on WhatsApp and we’ll put it right.</p>
            <Link to={ROUTES.returns} className={styles.calloutLink}>
              Returns &amp; exchanges →
            </Link>
          </aside>
        </div>
      </InfoSection>

      <InfoSection tone="dark" kicker="What we care about" title="The details that make a frame feel right">
        <FeatureGrid
          columns={4}
          items={[
            { Icon: BrushIcon, title: 'Made to order', text: 'Nothing sits in a warehouse. Each frame is printed and finished by hand once you order.' },
            { Icon: CheckCircleIcon, title: 'Honest pricing', text: 'One price list by size for every piece and every custom frame, with delivery at one flat rate.' },
            { Icon: HangIcon, title: 'Ready to hang', text: 'Your frame arrives with the hanging hardware fitted, so it goes straight onto the wall.' },
            { Icon: WhatsAppIcon, title: 'Real help', text: `Questions about sizes or a photo? A real person replies on WhatsApp, ${SITE.hours}.` },
          ]}
        />
      </InfoSection>

      <InfoSection kicker="Questions" title="Good to know">
        <div className={styles.faq}>
          <FaqList items={faqs} />
        </div>
      </InfoSection>

      <CtaBand
        title="Find the piece for your wall"
        text="Browse the collections, or send us a photo you’d love to see framed."
        actions={
          <>
            <Button to={ROUTES.shop} variant="light" size="lg">
              Shop the collection
            </Button>
            <Button href={whatsappLink('Hi Zauq, I have a question.')} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg">
              <WhatsAppIcon size={18} /> Chat on WhatsApp
            </Button>
          </>
        }
      />
    </>
  );
}
