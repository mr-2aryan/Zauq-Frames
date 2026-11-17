import { Link } from 'react-router';
import { PageHero } from '@/components/common';
import { WhatsAppIcon } from '@/components/icons';
import { CtaBand, LegalDocument } from '@/components/info';
import { ShieldCheck } from '@/components/illustrations';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';

const UPDATED = '17 November 2026';

/** /legal/refunds — how problems with an order are put right. */
export default function RefundsPage() {
  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      body: (
        <p>
          Every {SITE.name} frame is made to order, by hand, after we confirm your order with you. This policy explains what happens if something isn’t right, and how to
          reach us. For a quick, friendly summary, see <Link to={ROUTES.returns}>returns &amp; exchanges</Link>.
        </p>
      ),
    },
    {
      id: 'damaged',
      title: 'Damaged or incorrect orders',
      body: (
        <>
          <p>If your frame arrives damaged, or differs from what you ordered (a different piece or size), we’ll put it right.</p>
          <ul>
            <li>Message us on WhatsApp at {SITE.phone.display} as soon as it arrives, with your order number.</li>
            <li>Send clear photos of the frame, the print and the packaging.</li>
            <li>Keep the frame and its packaging until the issue is resolved.</li>
          </ul>
          <p>We’ll review the photos and agree with you how we’ll put it right.</p>
        </>
      ),
    },
    {
      id: 'custom',
      title: 'Custom and personalised frames',
      body: (
        <p>
          Custom photo frames and other personalised pieces are made only for you, so they aren’t eligible for change-of-mind returns. If a custom frame arrives damaged
          or different from your order, the section above applies and we’ll put it right.
        </p>
      ),
    },
    {
      id: 'changes',
      title: 'Changing or cancelling an order',
      body: (
        <p>
          The best time to change a size, a detail or your address — or to cancel — is when we call or WhatsApp you to confirm the order, before we start making
          anything. After that, message us as soon as possible and we’ll do our best to help. Once a frame is being made, we may not be able to change or cancel it.
        </p>
      ),
    },
    {
      id: 'payments',
      title: 'Payments',
      body: (
        <p>
          Orders are paid by cash on delivery, or by bank transfer, JazzCash or Easypaisa using the details we send on WhatsApp. If a payment needs to be returned to you
          as part of putting something right, we’ll arrange it with you directly on WhatsApp.
        </p>
      ),
    },
    {
      id: 'contact',
      title: 'How to reach us',
      body: (
        <p>
          WhatsApp {SITE.phone.display}, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, or use our <Link to={ROUTES.contact}>contact form</Link>. We reply{' '}
          {SITE.hours}.
        </p>
      ),
    },
  ];

  return (
    <>
      <title>{`Refund policy | ${SITE.name}`}</title>
      <meta name="description" content="Zauq Frames refund policy: what happens if a frame arrives damaged or different from your order, custom frames, and changing an order." />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Refund policy' }]}
        kicker="Legal"
        title="Refund"
        titleLight="policy."
        lead="If a frame arrives damaged or different from your order, we’ll put it right. Here’s exactly how that works."
        size="sm"
        media={<ShieldCheck />}
      />

      <LegalDocument
        updated={UPDATED}
        sections={sections}
        aside={
          <>
            Short version: <Link to={ROUTES.returns}>returns &amp; exchanges</Link>.
          </>
        }
      />

      <CtaBand
        title="Need to report a problem?"
        text="Send your order number and a few photos — we’ll take it from there."
        actions={
          <>
            <Button href={whatsappLink('Hi Zauq, there’s a problem with my order.')} target="_blank" rel="noopener noreferrer" variant="light" size="lg">
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
