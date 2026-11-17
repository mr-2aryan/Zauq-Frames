import { useId } from 'react';
import { PageHero } from '@/components/common';
import { ArrowRightIcon, BoxIcon, HangIcon, ImageIcon, TruckIcon, WhatsAppIcon } from '@/components/icons';
import { Button, Container, Section, SectionHeader } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCart } from '@/context/cart/useCart';
import { useCatalog } from '@/context/catalog/useCatalog';
import { CartItemRow, CartSummary } from '@/features/cart';
import { ProductGrid, useProducts } from '@/features/products';
import { formatPrice } from '@/utils/formatPrice';
import styles from './CartPage.module.css';

/** /cart — review the pieces, then on to checkout. */
export default function CartPage() {
  const headingId = useId();
  const { items, count, subtotal, savings, setQuantity, removeItem } = useCart();
  const { catalog } = useCatalog();
  const suggestions = useProducts({ sort: 'random', limit: 4 });

  const currency = items[0]?.currency ?? catalog?.currency ?? 'PKR';
  const deliveryFee = catalog?.deliveryFee ?? null;
  const empty = items.length === 0;

  return (
    <>
      <title>{empty ? `Your cart | ${SITE.name}` : `Your cart (${count}) | ${SITE.name}`}</title>
      <PageHero
        size="sm"
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Cart' }]}
        kicker={empty ? 'Your cart' : `${count} ${count === 1 ? 'piece' : 'pieces'} in your cart`}
        title="Your"
        titleLight="cart"
        lead={
          empty
            ? 'Nothing here yet — find a piece you love, or frame one of your own photos.'
            : `Every frame is made to order after checkout. Review your pieces, then check out — delivery is a flat ${deliveryFee === null ? '' : formatPrice(deliveryFee, currency)} anywhere in Pakistan.`
        }
      />

      <Container className={styles.page}>
        {empty ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <ImageIcon size={34} />
            </span>
            <h2 className={styles.emptyTitle}>Your cart is empty</h2>
            <p className={styles.emptyText}>Calligraphy, modern prints, pop culture and Heritage Pakistan — or your own photo, framed in any of five sizes.</p>
            <div className={styles.emptyActions}>
              <Button to={ROUTES.shop}>Shop the collection</Button>
              <Button to={ROUTES.customFrames} variant="secondary">
                Frame your photo
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.layout}>
            <section aria-labelledby={headingId}>
              <h2 id={headingId} className="sr-only">
                Pieces in your cart
              </h2>
              <ul className={styles.list}>
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} onQuantityChange={(quantity) => setQuantity(item.id, quantity)} onRemove={() => removeItem(item.id)} />
                ))}
              </ul>
              <div className={styles.more}>
                <Button to={ROUTES.shop} variant="secondary" size="sm">
                  ← Keep shopping
                </Button>
                <Button to={ROUTES.customFrames} variant="ghost" size="sm">
                  Frame your own photo
                </Button>
              </div>
            </section>

            <aside className={styles.aside} aria-label="Order summary">
              <h2 className={styles.asideTitle}>Summary</h2>
              <CartSummary subtotal={subtotal} savings={savings} deliveryFee={deliveryFee} currency={currency} count={count} />
              <Button to={ROUTES.checkout} size="lg" block>
                Check out <ArrowRightIcon size={18} />
              </Button>
              <p className={styles.pay}>Cash on delivery · Bank transfer · JazzCash · Easypaisa</p>
              <ul className={styles.assurances}>
                <li>
                  <TruckIcon size={17} /> Delivered in {SITE.leadTime}, anywhere in Pakistan
                </li>
                <li>
                  <BoxIcon size={17} /> Packed securely — damage covered
                </li>
                <li>
                  <HangIcon size={17} /> Arrives framed and ready to hang
                </li>
                <li>
                  <WhatsAppIcon size={17} /> Questions? WhatsApp {SITE.phone.display}
                </li>
              </ul>
            </aside>
          </div>
        )}
      </Container>

      <Section>
        <SectionHeader title={empty ? 'Popular right now' : 'You might also like'} description="A fresh pick from the collection" />
        <ProductGrid status={suggestions.status} products={suggestions.data?.items} error={suggestions.error} onRetry={suggestions.reload} placeholderCount={4} />
      </Section>
    </>
  );
}
