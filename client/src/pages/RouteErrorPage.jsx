import { isRouteErrorResponse, useRouteError } from 'react-router';
import { PageMessage } from '@/components/common';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';

/** Rendered by the router when a page throws while rendering or loading. */
export default function RouteErrorPage() {
  const error = useRouteError();

  if (import.meta.env.DEV) console.error(error);

  const description = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText || 'Request failed'}`
    : 'An unexpected error occurred. Please refresh the page or try again in a moment.';

  return (
    <PageMessage
      eyebrow="Something went wrong"
      title="We dropped the frame"
      description={description}
      actions={
        <>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
          <Button href={ROUTES.home} variant="secondary">
            Back to home
          </Button>
        </>
      }
    />
  );
}
