import { PageMessage } from '@/components/common';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import { useRouteHandle } from '@/hooks/useRouteHandle';

/** Placeholder for linked pages that have no content yet. */
export default function ComingSoonPage() {
  const title = useRouteHandle('title', 'Coming soon');

  return (
    <>
      <title>{`${title} | ${SITE.name}`}</title>
      <PageMessage
        eyebrow="Coming soon"
        title={title}
        description="We’re still framing this page. In the meantime, browse the collection or message us on WhatsApp — we’re happy to help."
        actions={
          <>
            <Button to={ROUTES.shop}>Shop the collection</Button>
            <Button href={whatsappLink(`Hi Zauq, I have a question about ${title.toLowerCase()}.`)} target="_blank" rel="noopener noreferrer" variant="secondary">
              Ask on WhatsApp
            </Button>
          </>
        }
      />
    </>
  );
}
