import { PageHero } from '@/components/common';
import { ChatPreview } from '@/components/illustrations';
import { Button, StatusMessage } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { countWord } from '@/utils/countWord';
import { formatPrice } from '@/utils/formatPrice';
import { ShopFaq } from '@/features/products';

/** The hero's chat: the questions people ask most, answered from the site's settings and price list. */
function chatMessages(catalog) {
  const sizes = catalog?.sizes ?? [];
  return [
    { q: 'How long does delivery take?', a: `${SITE.leadTime} from order to your door, anywhere in Pakistan.` },
    {
      q: 'Is there a delivery charge?',
      a: catalog ? `A flat ${formatPrice(catalog.deliveryFee, catalog.currency)} per order, however many frames.` : 'One flat fee per order, however many frames.',
    },
    { q: 'Can I pay cash on delivery?', a: 'Yes — or by bank transfer, JazzCash or Easypaisa.' },
    {
      q: 'Which sizes do you have?',
      a: sizes.length
        ? `${countWord(sizes.length, { capital: true })}, from ${sizes[0].width} × ${sizes[0].height} to ${sizes.at(-1).width} × ${sizes.at(-1).height} in.`
        : 'Every piece comes in all our frame sizes.',
    },
    { q: 'Can you frame my own photo?', a: 'Yes! Upload it on Custom frames and see it in every size before you order.' },
  ];
}

/** /help — the questions people ask before ordering, built from the live catalogue. */
export default function FaqPage() {
  const { status, catalog, error, reload } = useCatalog();

  return (
    <>
      <title>{`FAQs | ${SITE.name}`}</title>
      <meta name="description" content="Frame sizes, prices, delivery times, payment and custom photo frames — answers to common questions about ordering from Zauq Frames." />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'FAQ' }]}
        kicker="Help centre"
        title="Frequently asked"
        titleLight="questions"
        lead={`Sizes, prices, delivery, payment and custom photo frames — everything people ask before they order. Can’t find your answer? We reply on WhatsApp, ${SITE.hours}.`}
        actions={
          <>
            <Button to={ROUTES.trackOrder}>Track an order</Button>
            <Button to={ROUTES.contact} variant="secondary">
              Contact us
            </Button>
          </>
        }
        media={<ChatPreview messages={chatMessages(catalog)} hours={SITE.hours} href={whatsappLink('Hi Zauq Frames, I have a question.')} chips={['Delivery?', 'COD?', 'Sizes?']} />}
      />
      {catalog ? <ShopFaq catalog={catalog} /> : <StatusMessage status={status} message={status === 'loading' ? 'Loading…' : error?.message} onRetry={reload} />}
    </>
  );
}
