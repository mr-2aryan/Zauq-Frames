import { useId } from 'react';
import { BagIcon } from '@/components/icons';
import { Breadcrumbs, Button, Container, Panel } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCart } from '@/context/cart/useCart';
import { useCatalog } from '@/context/catalog/useCatalog';
import { CartItemRow, CartSummary, CheckoutForm, OrderConfirmation, useCheckout } from '@/features/cart';
import { formatPrice } from '@/utils/formatPrice';
import styles from './CartPage.module.css';

/** /cart — review items, then place the order. */
export default function CartPage() {
  const headingId = useId();
  const summaryId = useId();
  const { items, count, subtotal, savings, setQuantity, removeItem } = useCart();
  const { catalog } = useCatalog();
  const checkout = useCheckout();

  if (checkout.order) {
    return (
      <>
        <title>{`Order placed | ${SITE.name}`}</title>
        <Container className={styles.page}>
          <OrderConfirmation order={checkout.order} />
        </Container>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <title>{`Your cart | ${SITE.name}`}</title>
        <Container className={styles.page}>
          <Panel tone="tint" className={styles.empty}>
            <BagIcon size={44} className={styles.emptyIcon} />
            <h1 className={styles.emptyTitle}>Your cart is empty</h1>
            <p className={styles.emptyText}>Find a piece you love, or frame one of your own photos.</p>
            <div className={styles.emptyActions}>
              <Button to={ROUTES.shop}>Shop the collection</Button>
              <Button to={ROUTES.customFrames} variant="secondary">
                Frame your photo
              </Button>
            </div>
          </Panel>
        </Container>
      </>
    );
  }

  const currency = items[0].currency ?? catalog?.currency ?? 'PKR';
  const deliveryFee = catalog?.deliveryFee ?? null;
  const total = subtotal + (deliveryFee ?? 0);

  return (
    <>
      <title>{`Your cart (${count}) | ${SITE.name}`}</title>
      <Container className={styles.page}>
        <Breadcrumbs items={[{ label: 'Home', to: ROUTES.home }, { label: 'Cart' }]} />
        <h1 id={headingId} className={styles.title}>
          Your cart <span className={styles.count}>{count} {count === 1 ? 'item' : 'items'}</span>
        </h1>

        <div className={styles.layout}>
          <section aria-labelledby={headingId} className={styles.items}>
            <ul className={styles.list}>
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} onQuantityChange={(quantity) => setQuantity(item.id, quantity)} onRemove={() => removeItem(item.id)} />
              ))}
            </ul>
            <Button to={ROUTES.shop} variant="ghost" size="sm" className={styles.continue}>
              ← Continue shopping
            </Button>
          </section>

          <aside aria-labelledby={summaryId} className={styles.aside}>
            <Panel tone="outline" radius="lg" className={styles.card}>
              <h2 id={summaryId} className={styles.cardTitle}>
                Order summary
              </h2>
              <CartSummary subtotal={subtotal} savings={savings} deliveryFee={deliveryFee} currency={currency} count={count} />
            </Panel>
            <Panel tone="surface" radius="lg" className={styles.card}>
              <h2 className={styles.cardTitle}>Delivery details</h2>
              <CheckoutForm
                onSubmit={checkout.placeOrder}
                submitting={checkout.status === 'submitting'}
                fieldErrors={checkout.fieldErrors}
                error={checkout.error}
                totalLabel={formatPrice(total, currency)}
              />
            </Panel>
          </aside>
        </div>
      </Container>
    </>
  );
}
