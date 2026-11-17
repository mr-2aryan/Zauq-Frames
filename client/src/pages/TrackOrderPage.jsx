import { useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PageHero } from '@/components/common';
import { Button, Container } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { OrderTimeline, TrackedOrder } from '@/features/orders';
import { trackOrder } from '@/services/ordersApi';
import styles from './TrackOrderPage.module.css';

/** /help/track-order — look up an order by its number and phone, then see where it is. */
export default function TrackOrderPage() {
  const id = useId();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(() => searchParams.get('order') ?? '');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState({ status: 'idle', order: null, error: '' });
  const request = useRef(null);

  const submit = async (event) => {
    event.preventDefault();
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const order = await trackOrder(orderId, phone, { signal: controller.signal });
      setState({ status: 'success', order, error: '' });
      setSearchParams({ order: order.id }, { replace: true, preventScrollReset: true });
    } catch (error) {
      if (error.name === 'AbortError') return;
      setState({ status: 'error', order: null, error: error.message });
    }
  };

  return (
    <>
      <title>{`Track your order | ${SITE.name}`}</title>
      <meta name="description" content="Track a Zauq Frames order: see whether it’s confirmed, being framed, shipped or delivered, and when it should arrive." />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Help', to: ROUTES.faqs }, { label: 'Track your order' }]}
        kicker="Track your order"
        title="Where’s"
        titleLight="my frame?"
        lead="Enter your order number and the phone number you ordered with — you’ll see exactly where your frame is, from confirmed to delivered."
      >
        <form className={styles.form} onSubmit={submit}>
          <label className={styles.field} htmlFor={`${id}-order`}>
            <span className={styles.fieldLabel}>Order number</span>
            <input
              id={`${id}-order`}
              className={styles.input}
              value={orderId}
              onChange={(event) => setOrderId(event.target.value.toUpperCase())}
              placeholder="ZQ-A45545E9DD"
              autoComplete="off"
              spellCheck={false}
              required
            />
          </label>
          <label className={styles.field} htmlFor={`${id}-phone`}>
            <span className={styles.fieldLabel}>Phone number</span>
            <input
              id={`${id}-phone`}
              className={styles.input}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={SITE.phone.display.replace(/\d{7}$/, '1234567')}
              autoComplete="tel"
              required
            />
          </label>
          <Button type="submit" size="lg" className={styles.submit} disabled={state.status === 'loading'}>
            {state.status === 'loading' ? 'Finding…' : 'Track order'}
          </Button>
        </form>
      </PageHero>

      <Container className={styles.page}>
        {state.status === 'error' && (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        )}

        <div className={styles.result}>
          {state.order ? (
            <TrackedOrder order={state.order} />
          ) : (
            <section className={styles.guide} aria-labelledby={`${id}-guide`} data-reveal="fade-up" style={{ '--reveal-delay': '160ms' }}>
              <h2 id={`${id}-guide`} className={styles.guideTitle}>
                From order to wall
              </h2>
              <p className={styles.guideText}>
                Every frame is made for you, so it moves through five stages — about {SITE.leadTime} in all, {SITE.shippingTime} of it with the courier.
              </p>
              <OrderTimeline />
            </section>
          )}
        </div>
      </Container>
    </>
  );
}
