import { Link } from 'react-router';
import { PageHero } from '@/components/common';
import { WhatsAppIcon } from '@/components/icons';
import { CtaBand, LegalDocument } from '@/components/info';
import { DocumentIllustration } from '@/components/illustrations';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatPrice } from '@/utils/formatPrice';

const UPDATED = '17 November 2026';

/** /legal/terms — the terms for ordering from Zauq Frames. */
export default function TermsPage() {
  const { catalog } = useCatalog();
  const fee = catalog ? formatPrice(catalog.deliveryFee, catalog.currency) : 'a flat fee';

  const sections = [
    {
      id: 'about',
      title: 'About these terms',
      body: (
        <>
          <p>
            These terms apply when you browse or order from {SITE.name} ({SITE.fullName}), a framing studio based in {SITE.address}. By placing an order you agree to them,
            so please read them alongside our <Link to={ROUTES.privacy}>privacy policy</Link> and <Link to={ROUTES.refunds}>refund policy</Link>.
          </p>
          <p>When we say “we” or “us” we mean {SITE.name}; “you” means the person browsing or ordering.</p>
        </>
      ),
    },
    {
      id: 'orders',
      title: 'Orders and confirmation',
      body: (
        <>
          <p>When you place an order on the site you’ll receive an order number. Placing an order is a request to buy; it becomes a confirmed order once we’ve contacted you.</p>
          <ul>
            <li>We call or WhatsApp you to confirm the pieces, sizes, delivery address and payment before we start making anything.</li>
            <li>Please make sure the phone number you give us is correct and reachable — we can’t confirm an order we can’t reach you about.</li>
            <li>If something on your order can’t be made as described, we’ll tell you at confirmation and agree the next step with you.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'prices',
      title: 'Prices and promotions',
      body: (
        <>
          <p>
            Prices are shown in Pakistani rupees and depend on the frame size you choose. The same price list applies to every artwork and to custom photo frames. The
            price shown at checkout, including delivery, is the price you pay.
          </p>
          <p>
            From time to time we run promotions, such as a percentage off every frame. Promotional prices apply to orders placed while the promotion is running and may
            end or change without notice.
          </p>
        </>
      ),
    },
    {
      id: 'payment',
      title: 'Payment',
      body: (
        <>
          <p>You can pay in either of these ways:</p>
          <ul>
            <li>
              <strong>Cash on delivery</strong> — pay the courier when your order arrives.
            </li>
            <li>
              <strong>Bank transfer, JazzCash or Easypaisa</strong> — we send the payment details on WhatsApp after you order.
            </li>
          </ul>
          <p>Please only send money to the account details we give you directly on our own WhatsApp number, {SITE.phone.display}.</p>
        </>
      ),
    },
    {
      id: 'making',
      title: 'Made to order and timings',
      body: (
        <>
          <p>
            Every frame is printed and finished by hand after your order is confirmed. From order to delivery usually takes about {SITE.leadTime}, of which shipping is{' '}
            {SITE.shippingTime}. These times are estimates, not guarantees — couriers and busy periods can occasionally add a little time, and we’ll keep you posted if
            they do.
          </p>
        </>
      ),
    },
    {
      id: 'delivery',
      title: 'Delivery',
      body: (
        <>
          <p>
            We deliver to any city in Pakistan for one flat fee of {fee} per order, however many frames it contains. Please give a complete address and a reachable phone
            number so the courier can find you. Details are on our <Link to={ROUTES.shipping}>shipping &amp; delivery</Link> page.
          </p>
        </>
      ),
    },
    {
      id: 'problems',
      title: 'Damaged or incorrect items',
      body: (
        <>
          <p>
            Every frame is packed securely. If yours arrives damaged or different from your order, message us on WhatsApp with your order number and photos as soon as it
            arrives, and keep the frame and its packaging until we’ve resolved it. We’ll put it right. See <Link to={ROUTES.returns}>returns &amp; exchanges</Link>.
          </p>
        </>
      ),
    },
    {
      id: 'custom',
      title: 'Custom photo frames',
      body: (
        <>
          <p>When you upload a photo for a custom frame:</p>
          <ul>
            <li>You confirm that you own the photo or have permission to have it printed.</li>
            <li>We check every file before printing and contact you if the resolution, crop or colour needs attention.</li>
            <li>Custom and personalised frames are made only for you, so they aren’t eligible for change-of-mind returns.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'accounts',
      title: 'Your account',
      body: (
        <>
          <p>
            If you create an account, keep your password private and let us know if you think someone else has used it. You’re responsible for orders placed from your
            account.
          </p>
        </>
      ),
    },
    {
      id: 'content',
      title: 'Our website content',
      body: (
        <>
          <p>
            The text, photography and design of this website belong to {SITE.name} or are used with permission. Please don’t copy or reuse them without asking us first.
          </p>
        </>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      body: (
        <>
          <p>We may update these terms from time to time. The version on this page, with its “last updated” date, is the one that applies to new orders.</p>
        </>
      ),
    },
    {
      id: 'contact',
      title: 'Contact us',
      body: (
        <>
          <p>
            Questions about these terms? Message us on WhatsApp at {SITE.phone.display}, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, or use our{' '}
            <Link to={ROUTES.contact}>contact form</Link>. We reply {SITE.hours}.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <title>{`Terms & conditions | ${SITE.name}`}</title>
      <meta name="description" content="The terms for ordering framed art and custom photo frames from Zauq Frames: orders, prices, payment, delivery and more." />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Terms & conditions' }]}
        kicker="Legal"
        title="Terms"
        titleLight="& conditions."
        lead="The plain-language terms for ordering from Zauq Frames — how orders, payment, delivery and custom frames work."
        size="sm"
        media={<DocumentIllustration />}
      />

      <LegalDocument
        updated={UPDATED}
        intro={<p>We’ve kept these terms as short and clear as we can. If anything here is unclear, just ask — we’re happy to explain.</p>}
        sections={sections}
        aside={
          <>
            Also see our <Link to={ROUTES.privacy}>privacy policy</Link> and <Link to={ROUTES.refunds}>refund policy</Link>.
          </>
        }
      />

      <CtaBand
        title="Questions about an order?"
        text={`We reply on WhatsApp, ${SITE.hours}.`}
        actions={
          <>
            <Button href={whatsappLink('Hi Zauq, I have a question about your terms.')} target="_blank" rel="noopener noreferrer" variant="light" size="lg">
              <WhatsAppIcon size={18} /> Chat on WhatsApp
            </Button>
            <Button to={ROUTES.contact} variant="secondary" size="lg">
              Contact us
            </Button>
          </>
        }
      />
    </>
  );
}
