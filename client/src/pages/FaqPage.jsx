import { PageHero } from '@/components/common';
import { Button, StatusMessage } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { ShopFaq } from '@/features/products';

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
      />
      {catalog ? <ShopFaq catalog={catalog} /> : <StatusMessage status={status} message={status === 'loading' ? 'Loading…' : error?.message} onRetry={reload} />}
    </>
  );
}
