import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckIcon, WhatsAppIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import { CheckoutShell, OrderSummary } from '@/features/cart';
import { readLastOrder } from '@/features/cart/lastOrder.js';
import { formatDayRange, ORDER_STEPS } from '@/features/orders';
import { resolveAssetUrl } from '@/services/apiClient';
import { getOrder } from '@/services/ordersApi';
import { formatOrientation, matSuffix } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import styles from './OrderConfirmationPage.module.css';

const PAYMENT_LABELS = { cod: 'Cash on delivery', bank: 'Bank transfer, JazzCash or Easypaisa' };
const DAY_MS = 86_400_000;

/** /order-confirmation?order=ZQ-… — Shopify-style thank-you page. */
export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const orderId = (searchParams.get('order') ?? '').toUpperCase();
  // This tab's own order (with the delivery address), or the public copy from the server.
  const [saved] = useState(() => readLastOrder(orderId));
  const [state, setState] = useState(() => (saved ? { status: 'success', order: saved.order } : { status: orderId ? 'loading' : 'missing', order: null }));

  useEffect(() => {
    if (saved || !orderId) return undefined;
    const controller = new AbortController();
    getOrder(orderId, { signal: controller.signal })
      .then((order) => setState({ status: 'success', order }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'missing', order: null });
      });
    return () => controller.abort();
  }, [orderId, saved]);

  const { order } = state;
  const customer = saved?.customer;
  const currency = order?.currency ?? 'PKR';

  const summary = order ? (
    <OrderSummary
      lines={order.items.map((item, index) => ({
        key: `${item.name}-${index}`,
        image: item.image ?? resolveAssetUrl(item.photoUrl),
        crop: item.crop,
        name: item.name,
        meta: `${item.label} · ${formatOrientation(item.orientation)}${matSuffix(item.mat)}`,
        quantity: item.quantity,
        price: item.lineTotal,
      }))}
      subtotal={order.subtotal}
      savings={order.items.reduce((sum, item) => sum + (item.listPrice - item.unitPrice) * item.quantity, 0)}
      savingsLabel={order.promotion?.label ?? 'Discount'}
      delivery={order.deliveryFee}
      total={order.total}
      currency={currency}
    />
  ) : null;

  if (state.status !== 'success') {
    return (
      <CheckoutShell summary={null} total={0} currency={currency}>
        <title>{`Order | ${SITE.name}`}</title>
        <div className={styles.missing}>
          {state.status === 'loading' ? (
            <p>Loading your order…</p>
          ) : (
            <>
              <h1 className={styles.title}>We couldn’t find that order</h1>
              <p className={styles.text}>Check the order number in your confirmation, or track it with your order number and phone.</p>
              <div className={styles.actions}>
                <Button to={ROUTES.trackOrder}>Track an order</Button>
                <Button to={ROUTES.shop} variant="secondary">
                  Continue shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </CheckoutShell>
    );
  }

  const firstName = (customer?.name ?? order.customer?.name ?? '').split(' ')[0];
  const placed = Date.parse(order.createdAt);
  const arrives = formatDayRange(new Date(placed + 7 * DAY_MS).toISOString(), new Date(placed + 10 * DAY_MS).toISOString());
  const bank = order.paymentMethod === 'bank';

  return (
    <CheckoutShell summary={summary} total={order.total} currency={currency}>
      <title>{`Thank you — order ${order.id} | ${SITE.name}`}</title>

      <header className={styles.head}>
        <span className={styles.tick} aria-hidden="true">
          <CheckIcon size={26} />
        </span>
        <div>
          <p className={styles.number}>Order {order.id}</p>
          <h1 className={styles.title}>Thank you{firstName ? `, ${firstName}` : ''}!</h1>
        </div>
      </header>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Your order is confirmed</h2>
        <p className={styles.text}>
          {bank
            ? `We’ll WhatsApp you our bank, JazzCash and Easypaisa details shortly. We start making your frames once payment is confirmed.`
            : `We’ll call or WhatsApp you shortly to confirm the details. Pay the courier in cash when your frames arrive.`}
        </p>
        <p className={styles.arrival}>
          Estimated delivery <strong>{arrives}</strong>
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Order updates</h2>
        <ol className={styles.steps}>
          {ORDER_STEPS.map((step, index) => (
            <li key={step.status} className={index === 0 ? styles.stepDone : undefined}>
              <span aria-hidden="true">{index === 0 ? <CheckIcon size={13} /> : index + 1}</span>
              {step.label}
            </li>
          ))}
        </ol>
        <p className={styles.text}>
          Follow every step on{' '}
          <Link to={`${ROUTES.trackOrder}?order=${encodeURIComponent(order.id)}`} className={styles.link}>
            Track your order
          </Link>{' '}
          with this order number and your phone.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Customer information</h2>
        <dl className={styles.info}>
          <div>
            <dt>Contact</dt>
            <dd>
              {customer ? (
                <>
                  {customer.phone}
                  {customer.email && (
                    <>
                      <br />
                      {customer.email}
                    </>
                  )}
                </>
              ) : (
                order.customer?.name
              )}
            </dd>
          </div>
          <div>
            <dt>Payment method</dt>
            <dd>
              {PAYMENT_LABELS[order.paymentMethod] ?? PAYMENT_LABELS.cod}
              <br />
              {formatPrice(order.total, currency)}
            </dd>
          </div>
          <div>
            <dt>Shipping address</dt>
            <dd>
              {customer ? (
                <>
                  {customer.name}
                  <br />
                  {customer.address}
                  <br />
                  {customer.city}, Pakistan
                </>
              ) : (
                <>{order.customer?.city}, Pakistan</>
              )}
            </dd>
          </div>
          <div>
            <dt>Shipping method</dt>
            <dd>
              Standard courier
              <br />
              {SITE.leadTime} · {formatPrice(order.deliveryFee, currency)}
            </dd>
          </div>
        </dl>
      </section>

      <div className={styles.foot}>
        <p className={styles.help}>
          Need help?{' '}
          <a href={whatsappLink(`Hi Zauq, I have a question about order ${order.id}.`)} target="_blank" rel="noopener noreferrer" className={styles.link}>
            <WhatsAppIcon size={15} /> Message us
          </a>
        </p>
        <Button to={ROUTES.shop} size="lg" className={styles.continue}>
          Continue shopping
        </Button>
      </div>
    </CheckoutShell>
  );
}
