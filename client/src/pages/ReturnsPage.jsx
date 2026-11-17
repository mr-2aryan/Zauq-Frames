import { Link } from 'react-router';
import { FaqList, PageHero } from '@/components/common';
import { CheckCircleIcon, HelpIcon, ImageIcon, WhatsAppIcon } from '@/components/icons';
import { CheckList, CtaBand, FeatureGrid, InfoSection, SplitBlock, StepList } from '@/components/info';
import { PackageBox, ShieldCheck } from '@/components/illustrations';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import styles from './InfoPage.module.css';

/** /help/returns — what happens if a frame arrives damaged or wrong. */
export default function ReturnsPage() {
  const faqs = [
    {
      question: 'My frame arrived damaged. What do I do?',
      answer: `Keep the frame and the packaging, take a few clear photos, and message us on WhatsApp at ${SITE.phone.display} with your order number. We’ll put it right.`,
    },
    {
      question: 'I received a different piece or size from the one I ordered.',
      answer: 'Message us on WhatsApp with your order number and a photo of what arrived. If it’s different from your order, we’ll put it right.',
    },
    {
      question: 'Can I return a custom photo frame?',
      answer: 'Custom and personalised frames are made only for you, so they aren’t eligible for change-of-mind returns. If one arrives damaged or different from your order, we’ll put it right.',
    },
    {
      question: 'Can I change my order after placing it?',
      answer: 'The best moment is when we call or WhatsApp you to confirm it — before we start making anything. Message us as soon as possible and we’ll do our best to help.',
    },
  ];

  return (
    <>
      <title>{`Returns & exchanges | ${SITE.name}`}</title>
      <meta name="description" content="If a Zauq frame arrives damaged or different from your order, message us on WhatsApp and we’ll put it right. Here’s how it works." />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Returns & exchanges' }]}
        kicker="Returns & exchanges"
        title="If something’s wrong,"
        titleLight="we’ll put it right."
        lead="Every frame is packed securely, but journeys aren’t always kind. If yours arrives damaged or different from what you ordered, tell us and we’ll make it right."
        actions={
          <Button href={whatsappLink('Hi Zauq, there’s a problem with my order.')} target="_blank" rel="noopener noreferrer" size="lg">
            <WhatsAppIcon size={18} /> Report a problem
          </Button>
        }
        media={<ShieldCheck />}
      />

      <InfoSection kicker="How it works" title="Three simple steps">
        <StepList
          steps={[
            {
              title: 'Tell us as soon as it arrives',
              text: `Message us on WhatsApp at ${SITE.phone.display} with your order number. Please keep the frame and its packaging until we’ve sorted it out.`,
            },
            { title: 'Send a few photos', text: 'Clear photos of the frame, the print and the box help us see exactly what happened — and fix it faster.' },
            { title: 'We put it right', text: 'We’ll agree the fix with you on WhatsApp and take care of it.' },
          ]}
        />
      </InfoSection>

      <InfoSection tone="surface" kicker="What’s covered" title="When we’ll put it right">
        <div className={styles.compare}>
          <div className={styles.compareCard} data-reveal="fade-up">
            <h3>Covered</h3>
            <CheckList items={['A frame or print damaged in transit', 'A different piece from the one you ordered', 'A different size from the one you ordered', 'A custom frame that arrives damaged or different from your order']} />
          </div>
          <div className={styles.compareCard} data-reveal="fade-up" style={{ '--reveal-delay': '80ms' }}>
            <h3>Not covered</h3>
            <CheckList tone="bad" items={['Change-of-mind returns on custom and personalised frames — they’re made only for you']} />
          </div>
        </div>
      </InfoSection>

      <InfoSection>
        <SplitBlock kicker="Made to order" title="Why custom frames are different" media={<PackageBox />}>
          <p>
            Every Zauq frame is made after you order it, and a custom frame is made from <strong>your</strong> photo, at <strong>your</strong> size and crop. It can’t be
            sold to anyone else, so we can’t accept it back simply because you’ve changed your mind.
          </p>
          <p>
            That’s why we preview every size before you order and check every photo before printing — and why, if anything does arrive wrong, we always put it right.
          </p>
          <p>
            <Link to={ROUTES.customFrames} className={styles.inlineLink}>
              Preview your photo in every size →
            </Link>
          </p>
        </SplitBlock>
      </InfoSection>

      <InfoSection tone="surface" kicker="Avoid surprises" title="Get it right first time">
        <FeatureGrid
          columns={3}
          items={[
            { Icon: HelpIcon, title: 'Unsure of the size?', text: 'Each product page has a size guide in centimetres, and we’re happy to help you choose on WhatsApp.' },
            { Icon: ImageIcon, title: 'Framing a photo?', text: 'Preview it in all five sizes and drag it to set the crop before you order.' },
            { Icon: CheckCircleIcon, title: 'Check at confirmation', text: 'We confirm every order by call or WhatsApp — the perfect moment to change a size or detail.' },
          ]}
        />
      </InfoSection>

      <InfoSection kicker="Questions" title="Returns FAQs">
        <div className={styles.faq}>
          <FaqList items={faqs} />
        </div>
        <p className={styles.tip} style={{ marginTop: 28 }}>
          <span>
            <strong>Looking for the full policy?</strong> See our <Link to={ROUTES.refunds}>refund policy</Link> and <Link to={ROUTES.terms}>terms &amp; conditions</Link>.
          </span>
        </p>
      </InfoSection>

      <CtaBand
        title="Something not right?"
        text={`Message us with your order number and a few photos — ${SITE.hours}.`}
        actions={
          <>
            <Button href={whatsappLink('Hi Zauq, there’s a problem with my order.')} target="_blank" rel="noopener noreferrer" variant="light" size="lg">
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
