import { Outlet, ScrollRestoration } from 'react-router';

/**
 * Checkout and its thank-you page, Shopify-style: no site header, footer or
 * floating buttons — the page (CheckoutShell) shows just the logo, the form
 * and the order summary.
 */
export function CheckoutLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
