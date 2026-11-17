import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useAuth } from '@/context/auth/useAuth';
import { useCart } from '@/context/cart/useCart';
import { useCatalog } from '@/context/catalog/useCatalog';
import { CheckoutShell, OrderSummary, useCheckout } from '@/features/cart';
import { resolveAssetUrl } from '@/services/apiClient';
import { updateProfile } from '@/services/authApi';
import { cn } from '@/utils/cn';
import { formatOrientation } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import styles from './CheckoutPage.module.css';

/** Payment choices; `value`s match the server's PAYMENT_METHODS. */
const PAYMENT_OPTIONS = [
  {
    value: 'cod',
    label: 'Cash on delivery (COD)',
    detail: 'Pay the courier in cash when your frames arrive. We confirm your order by call or WhatsApp before we start making it.',
    badges: ['COD'],
  },
  {
    value: 'bank',
    label: 'Bank transfer, JazzCash or Easypaisa',
    detail: 'After you place your order we’ll WhatsApp you our account details. Making starts once your payment is confirmed.',
    badges: ['Bank', 'JazzCash', 'Easypaisa'],
  },
];

const EMPTY = { email: '', phone: '', firstName: '', lastName: '', address: '', area: '', city: '', notes: '' };

function fromUser(user) {
  if (!user) return {};
  const [firstName = '', ...rest] = (user.name ?? '').trim().split(/\s+/);
  return { email: user.email ?? '', phone: user.phone ?? '', firstName, lastName: rest.join(' '), address: user.address ?? '', city: user.city ?? '' };
}

const lineImage = (item) => (item.type === 'product' ? item.image : resolveAssetUrl(item.photo?.url ?? item.image));

/** /checkout — Shopify-style: contact, delivery, shipping and payment on the left, the order on the right. */
export default function CheckoutPage() {
  const id = useId();
  const navigate = useNavigate();
  const { items, subtotal, savings } = useCart();
  const { catalog } = useCatalog();
  const { user, updateUser } = useAuth();
  const checkout = useCheckout();
  const [form, setForm] = useState(() => ({ ...EMPTY, ...fromUser(user) }));
  const [payment, setPayment] = useState('cod');
  const [saveDetails, setSaveDetails] = useState(true);
  const prefilled = useRef(Boolean(user));

  // A signed-in customer's details arrive after the first render: fill in what's still empty, once.
  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    const saved = fromUser(user);
    setForm((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, value || saved[key] || ''])));
  }, [user]);

  // Nothing to pay for: back to the cart (but not while the order is going through).
  const placing = checkout.status === 'submitting' || checkout.status === 'success';
  useEffect(() => {
    if (!items.length && !placing) navigate(ROUTES.cart, { replace: true });
  }, [items.length, placing, navigate]);

  const currency = items[0]?.currency ?? catalog?.currency ?? 'PKR';
  const delivery = catalog?.deliveryFee ?? 0;
  const total = subtotal + delivery;
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const error = (field) => checkout.fieldErrors[field];

  const submit = async (event) => {
    event.preventDefault();
    const name = `${form.firstName} ${form.lastName}`.trim();
    const address = [form.address.trim(), form.area.trim()].filter(Boolean).join(', ');
    const customer = { name, phone: form.phone, email: form.email, address, city: form.city, ...(form.notes.trim() ? { notes: form.notes } : {}) };
    const order = await checkout.placeOrder({ customer, paymentMethod: payment });
    if (!order) return;
    if (user && saveDetails) {
      updateProfile({ name, phone: form.phone, address, city: form.city })
        .then((data) => updateUser(data.user))
        .catch(() => {});
    }
    navigate(`${ROUTES.orderConfirmation}?order=${encodeURIComponent(order.id)}`, { replace: true });
  };

  const summary = (
    <OrderSummary
      lines={items.map((item) => ({
        key: item.id,
        image: lineImage(item),
        crop: item.crop,
        name: item.name,
        meta: `${item.sizeLabel} · ${formatOrientation(item.orientation)}`,
        quantity: item.quantity,
        price: item.unitPrice * item.quantity,
      }))}
      subtotal={subtotal}
      savings={savings}
      savingsLabel={catalog?.promotion.label ?? 'Discount'}
      delivery={delivery}
      total={total}
      currency={currency}
    />
  );

  return (
    <CheckoutShell summary={summary} total={total} currency={currency}>
      <title>{`Checkout | ${SITE.name}`}</title>

      <nav aria-label="Checkout steps" className={styles.crumbs}>
        <Link to={ROUTES.cart}>Cart</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="step">Information &amp; payment</span>
        <span aria-hidden="true">›</span>
        <span className={styles.later}>Confirmation</span>
      </nav>

      <form className={styles.form} onSubmit={submit} noValidate>
        <section className={styles.section} aria-labelledby={`${id}-contact`}>
          <div className={styles.sectionHead}>
            <h2 id={`${id}-contact`} className={styles.title}>
              Contact
            </h2>
            {!user && (
              <Link to={`${ROUTES.account}?next=${encodeURIComponent(ROUTES.checkout)}`} className={styles.link}>
                Log in
              </Link>
            )}
          </div>
          {user && (
            <p className={styles.signedIn}>
              Signed in as <strong>{user.email}</strong>
            </p>
          )}
          <Float id={`${id}-phone`} label="Phone or WhatsApp number" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={error('phone')} required />
          <Float id={`${id}-email`} label="Email (optional)" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={error('email')} />
        </section>

        <section className={styles.section} aria-labelledby={`${id}-delivery`}>
          <h2 id={`${id}-delivery`} className={styles.title}>
            Delivery
          </h2>
          <div className={styles.float}>
            <div className={styles.floatBox}>
              <select id={`${id}-country`} className={cn(styles.input, styles.select)} value="PK" onChange={() => {}} autoComplete="country">
                <option value="PK">Pakistan</option>
              </select>
              <label htmlFor={`${id}-country`} className={styles.label}>
                Country/Region
              </label>
            </div>
          </div>
          <div className={styles.row}>
            <Float id={`${id}-first`} label="First name" autoComplete="given-name" value={form.firstName} onChange={set('firstName')} error={error('name')} required />
            <Float id={`${id}-last`} label="Last name" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} />
          </div>
          <Float id={`${id}-address`} label="Address" autoComplete="address-line1" value={form.address} onChange={set('address')} error={error('address')} required />
          <Float id={`${id}-area`} label="Apartment, area or landmark (optional)" autoComplete="address-line2" value={form.area} onChange={set('area')} />
          <Float id={`${id}-city`} label="City" autoComplete="address-level2" value={form.city} onChange={set('city')} error={error('city')} required />
          <Float id={`${id}-notes`} label="Delivery notes (optional)" as="textarea" rows={2} maxLength={1000} value={form.notes} onChange={set('notes')} error={error('notes')} />
          {user && (
            <label className={styles.check}>
              <input type="checkbox" checked={saveDetails} onChange={(event) => setSaveDetails(event.target.checked)} />
              Save this information for next time
            </label>
          )}
        </section>

        <section className={styles.section} aria-labelledby={`${id}-shipping`}>
          <h2 id={`${id}-shipping`} className={styles.title}>
            Shipping method
          </h2>
          <div className={styles.group}>
            <div className={cn(styles.choice, styles.choiceOn)}>
              <span className={styles.radio} aria-hidden="true" />
              <span className={styles.choiceText}>
                <strong>Standard courier</strong>
                <span>
                  {SITE.leadTime} from order to door · {SITE.shippingTime} in transit
                </span>
              </span>
              <strong className={styles.choicePrice}>{formatPrice(delivery, currency)}</strong>
            </div>
          </div>
        </section>

        <fieldset className={styles.section}>
          <legend className={styles.title}>Payment</legend>
          <p className={styles.sub}>Pay on delivery, or by transfer after you order — we never ask for card details.</p>
          <div className={styles.group}>
            {PAYMENT_OPTIONS.map((option) => {
              const on = payment === option.value;
              return (
                <div key={option.value} className={styles.payment}>
                  <label className={cn(styles.choice, on && styles.choiceOn)}>
                    <input type="radio" name={`${id}-payment`} value={option.value} checked={on} onChange={() => setPayment(option.value)} className="sr-only" />
                    <span className={styles.radio} aria-hidden="true" />
                    <span className={styles.choiceText}>
                      <strong>{option.label}</strong>
                    </span>
                    <span className={styles.badges} aria-hidden="true">
                      {option.badges.map((badge) => (
                        <span key={badge}>{badge}</span>
                      ))}
                    </span>
                  </label>
                  {/* The chosen option opens to explain what happens next. */}
                  <div className={cn(styles.detail, on && styles.detailOn)}>
                    <div>
                      <p>{option.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>

        {checkout.error && (
          <p className={styles.alert} role="alert">
            {checkout.error}
          </p>
        )}

        <Button type="submit" size="lg" block className={styles.submit} disabled={checkout.status === 'submitting' || !items.length}>
          {checkout.status === 'submitting' ? 'Placing your order…' : 'Complete order'}
        </Button>
        <p className={styles.legal}>
          Custom photo frames are made just for you and aren’t eligible for change-of-mind returns. If anything arrives damaged, we’ll put it right.
        </p>
      </form>

      <footer className={styles.policies}>
        <Link to={ROUTES.refunds}>Refund policy</Link>
        <Link to={ROUTES.shipping}>Shipping</Link>
        <Link to={ROUTES.privacy}>Privacy policy</Link>
        <Link to={ROUTES.terms}>Terms of service</Link>
        <Link to={ROUTES.contact}>Contact</Link>
      </footer>
    </CheckoutShell>
  );
}

/** A Shopify-style field: the label sits inside and floats up once there's a value. */
function Float({ id, label, error, as: Tag = 'input', ...props }) {
  return (
    <div className={cn(styles.float, error && styles.invalid)}>
      <div className={styles.floatBox}>
        <Tag id={id} className={cn(styles.input, Tag === 'textarea' && styles.textarea)} placeholder=" " aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
