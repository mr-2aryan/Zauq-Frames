import { PageMessage } from '@/components/common';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';

export default function NotFoundPage() {
  return (
    <>
      <title>{`Page not found | ${SITE.name}`}</title>
      <PageMessage
        eyebrow="404"
        title="Nothing on this wall"
        description="The page you’re looking for doesn’t exist or has moved."
        actions={
          <>
            <Button to={ROUTES.home}>Back to home</Button>
            <Button to={ROUTES.shop} variant="secondary">
              Shop the collection
            </Button>
          </>
        }
      />
    </>
  );
}
