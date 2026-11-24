import { Link } from 'react-router';
import { FaqList, PageHero } from '@/components/common';
import { BoxIcon, ClockIcon, SearchIcon, TruckIcon, WhatsAppIcon } from '@/components/icons';
import { CheckList, CtaBand, FactCards, FeatureGrid, InfoSection, SplitBlock, StepList } from '@/components/info';
import { CalendarIllustration, DispatchBoard, PackageBox } from '@/components/illustrations';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatPrice } from '@/utils/formatPrice';
import styles from './InfoPage.module.css';

/** /help/shipping — delivery fee, timings, packing and tracking. */
export default function ShippingPage() {
  const { catalog } = useCatalog();
  const fee = catalog ? formatPrice(catalog.deliveryFee, catalog.currency) : null;

  const faqs = [
    { question: 'Does delivery cost more if I order several frames?', answer: `No. Delivery is one flat ${fee ?? 'fee'} per order, however many frames are in it.` },
    { question: 'Which cities do you deliver to?', answer: 'Any city in Pakistan, at the same flat rate.' },
    {
      question: 'Why does it take a week or more?',
      answer: `Because your frame is made for you. We print and frame it after confirming your order, then the courier takes ${SITE.shippingTime}. From order to door it’s about ${SITE.leadTime}.`,
    },
    {
      question: 'Can I pay when it arrives?',
      answer: 'Yes — cash on delivery is available. You can also pay by bank transfer, JazzCash or Easypaisa; we send the details on WhatsApp after you order.',
    },
    {
      question: 'How do I know where my order is?',
      answer: (
        <>
          Use <Link to={ROUTES.trackOrder}>Track your order</Link> with your order number and the phone number you ordered with, or message us on WhatsApp.
        </>
      ),
    },
  ];

  return (
    <>
      <title>{`Shipping & delivery | ${SITE.name}`}</title>
      <meta name="description" content={`Flat-rate delivery to any city in Pakistan. Every frame is made to order and reaches you in about ${SITE.leadTime}, ready to hang.`} />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Shipping & delivery' }]}
        kicker="Shipping & delivery"
        title={fee ? `${fee} delivery,` : 'Flat-rate delivery,'}
        titleLight="anywhere in Pakistan."
        lead={`One flat fee per order, to any city. Every frame is made for you, packed securely and delivered ready to hang in about ${SITE.leadTime}.`}
        actions={
          <>
            <Button to={ROUTES.trackOrder} size="lg">
              Track an order
            </Button>
            <Button to={ROUTES.shop} variant="secondary" size="lg">
              Shop the collection
            </Button>
          </>
        }
        media={<DispatchBoard fee={fee} leadTime={SITE.leadTime} />}
      />

      <InfoSection kicker="At a glance" title="Delivery in four numbers">
        <FactCards
          items={[
            { value: fee ?? 'Flat fee', label: 'Delivery per order', note: 'However many frames' },
            { value: SITE.leadTime, label: 'Order to door', note: 'Made to order, then shipped' },
            { value: SITE.shippingTime, label: 'With the courier', note: 'After your frame is ready' },
            { value: 'Every city', label: 'Across Pakistan', note: 'One rate, nationwide' },
          ]}
        />
      </InfoSection>

      <InfoSection>
        <SplitBlock kicker="Timeline" title={`What happens in those ${SITE.leadTime}`} media={<CalendarIllustration />}>
          <p>
            We don’t keep finished frames on a shelf. Each one is made after you order, which is why delivery takes a little longer than a parcel from a warehouse — and why
            every frame arrives exactly as you chose it.
          </p>
          <StepList
            steps={[
              { title: 'Order confirmed', text: 'We call or WhatsApp you to confirm the details and payment.' },
              { title: 'Made for you', text: 'Your piece is printed and framed by hand, then checked.' },
              { title: 'Packed and dispatched', text: 'Wrapped and boxed securely, then handed to the courier.' },
              { title: 'Delivered', text: `${SITE.shippingTime} later it’s at your door, ready to hang.` },
            ]}
          />
        </SplitBlock>
      </InfoSection>

      <InfoSection tone="surface" kicker="Good to know" title="Everything about your delivery">
        <FeatureGrid
          columns={4}
          items={[
            { Icon: TruckIcon, title: 'One flat rate', text: `${fee ?? 'A flat fee'} per order to any city — add as many frames as you like.` },
            { Icon: ClockIcon, title: 'Honest timings', text: `About ${SITE.leadTime} from order to door, ${SITE.shippingTime} of it in transit.` },
            { Icon: BoxIcon, title: 'Packed to travel', text: 'Every frame is wrapped and boxed to arrive safely.' },
            { Icon: SearchIcon, title: 'Track any time', text: 'Check where your order is with its number and your phone.' },
          ]}
        />
      </InfoSection>

      <InfoSection>
        <SplitBlock kicker="When it arrives" title="Open it with care" media={<PackageBox />} reverse>
          <p>Your frame is packed to survive the journey. When it arrives:</p>
          <CheckList
            items={[
              'Open the box on a soft, clean surface and lift the frame out by its edges.',
              'Check the frame and print before you throw the packaging away.',
              'If anything is damaged or different from your order, take a few photos and message us on WhatsApp — we’ll put it right.',
            ]}
          />
          <p>
            <Link to={ROUTES.returns} className={styles.inlineLink}>
              Read our returns &amp; exchanges policy →
            </Link>
          </p>
        </SplitBlock>
      </InfoSection>

      <InfoSection tone="surface" kicker="Payment" title="Pay the way that suits you">
        <div className={styles.cards}>
          <div className={styles.card} data-reveal="fade-up">
            <h3>Cash on delivery</h3>
            <p>Pay the courier when your frame arrives.</p>
          </div>
          <div className={styles.card} data-reveal="fade-up" style={{ '--reveal-delay': '60ms' }}>
            <h3>Bank transfer, JazzCash or Easypaisa</h3>
            <p>We send the payment details on WhatsApp after you order.</p>
          </div>
          <div className={styles.card} data-reveal="fade-up" style={{ '--reveal-delay': '120ms' }}>
            <h3>Confirmed first</h3>
            <p>Whichever you choose, we confirm your order by call or WhatsApp before we start making it.</p>
          </div>
        </div>
      </InfoSection>

      <InfoSection kicker="Questions" title="Shipping FAQs">
        <div className={styles.faq}>
          <FaqList items={faqs} />
        </div>
      </InfoSection>

      <CtaBand
        title="Questions about a delivery?"
        text={`Message us with your order number and we’ll check on it — ${SITE.hours}.`}
        actions={
          <>
            <Button href={whatsappLink('Hi Zauq, I have a question about delivery.')} target="_blank" rel="noopener noreferrer" variant="light" size="lg">
              <WhatsAppIcon size={18} /> Chat on WhatsApp
            </Button>
            <Button to={ROUTES.trackOrder} variant="secondary" size="lg">
              Track an order
            </Button>
          </>
        }
      />
    </>
  );
}
