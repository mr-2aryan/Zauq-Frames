import { Link } from 'react-router';
import { PageHero } from '@/components/common';
import { MailIcon } from '@/components/icons';
import { CtaBand, LegalDocument } from '@/components/info';
import { PrivacyEnvelope } from '@/components/illustrations';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';

const UPDATED = '17 November 2026';

/** /legal/privacy — what the site collects, why, and your choices. */
export default function PrivacyPage() {
  const sections = [
    {
      id: 'who',
      title: 'Who we are',
      body: (
        <p>
          {SITE.name} ({SITE.fullName}) is a framing studio in {SITE.address}. This policy explains what information we collect when you use our website, why we collect
          it and what we do with it.
        </p>
      ),
    },
    {
      id: 'collect',
      title: 'What we collect',
      body: (
        <>
          <p>We only collect what we need to make and deliver your order and to answer you:</p>
          <ul>
            <li>
              <strong>Order details</strong> — your name, phone number, email (if you give one), delivery address and city, and the items you order.
            </li>
            <li>
              <strong>Custom frame photos</strong> — the photos you upload to be printed, and the size, orientation and crop you choose.
            </li>
            <li>
              <strong>Account details</strong> — if you create an account, your email address and your password. We store passwords only in a hashed form, never as plain
              text.
            </li>
            <li>
              <strong>Messages</strong> — what you send us through the contact form, including your name, phone, email and message.
            </li>
            <li>
              <strong>Reviews</strong> — if you review a piece, the name, city, rating and text you choose to publish, and an order number if you add one.
            </li>
            <li>
              <strong>Newsletter</strong> — your email address, if you subscribe.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'use',
      title: 'How we use it',
      body: (
        <ul>
          <li>To confirm your order by call or WhatsApp, make it, and deliver it.</li>
          <li>To print your custom frame, and to contact you if your photo needs attention.</li>
          <li>To reply to your messages and help with any problem with an order.</li>
          <li>To let you sign in and see your orders, if you have an account.</li>
          <li>To send the newsletter, only if you subscribed.</li>
        </ul>
      ),
    },
    {
      id: 'sharing',
      title: 'Who we share it with',
      body: (
        <>
          <p>
            <strong>We never sell your information.</strong> To deliver your order, we share the details the courier needs — your name, phone number and address. We don’t
            share your information with anyone else unless the law requires us to.
          </p>
        </>
      ),
    },
    {
      id: 'browser',
      title: 'Cookies and your browser',
      body: (
        <>
          <p>We keep this simple too:</p>
          <ul>
            <li>
              <strong>Your cart</strong> is saved in your browser’s local storage, so it’s still there when you come back. It stays on your device.
            </li>
            <li>
              <strong>Signing in</strong> uses a cookie that keeps you logged in to your account. It’s only used for that.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'security',
      title: 'Keeping it safe',
      body: (
        <p>
          We take reasonable care to protect your information, store passwords only in hashed form, and limit access to the details needed to fulfil your order. No
          website can be perfectly secure, so please keep your account password private.
        </p>
      ),
    },
    {
      id: 'choices',
      title: 'Your choices',
      body: (
        <>
          <p>You can ask us at any time to:</p>
          <ul>
            <li>see the information we hold about you,</li>
            <li>correct anything that’s wrong, or</li>
            <li>delete your account, messages or uploaded photos where we no longer need them for an order.</li>
          </ul>
          <p>
            Just message us on WhatsApp or email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      body: <p>If we change how we use your information, we’ll update this page and its “last updated” date.</p>,
    },
    {
      id: 'contact',
      title: 'Contact us',
      body: (
        <p>
          Questions about your privacy? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, message us on WhatsApp at {SITE.phone.display}, or use our{' '}
          <Link to={ROUTES.contact}>contact form</Link>.
        </p>
      ),
    },
  ];

  return (
    <>
      <title>{`Privacy policy | ${SITE.name}`}</title>
      <meta name="description" content="What information Zauq Frames collects, why, who it’s shared with and your choices — in plain language." />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Privacy policy' }]}
        kicker="Legal"
        title="Privacy"
        titleLight="policy."
        lead="We collect only what we need to make, deliver and support your order — and we never sell it."
        size="sm"
        media={<PrivacyEnvelope />}
      />

      <LegalDocument
        updated={UPDATED}
        intro={<p>In short: your details are used to make and deliver your frames and to talk to you about them. That’s it.</p>}
        sections={sections}
        aside={
          <>
            Also see our <Link to={ROUTES.terms}>terms &amp; conditions</Link>.
          </>
        }
      />

      <CtaBand
        title="A question about your data?"
        text="Email or message us and we’ll help."
        actions={
          <>
            <Button href={`mailto:${SITE.email}`} variant="light" size="lg">
              <MailIcon size={18} /> Email us
            </Button>
            <Button href={whatsappLink('Hi Zauq, I have a privacy question.')} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg">
              WhatsApp us
            </Button>
          </>
        }
      />
    </>
  );
}
