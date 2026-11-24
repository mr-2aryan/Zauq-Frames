import { useEffect, useId, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { PageHero } from '@/components/common';
import { AccountPeek } from '@/components/illustrations';
import { BagIcon, ChevronDownIcon, ClockIcon, TruckIcon } from '@/components/icons';
import { Button, Container } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { formatDay, formatDayRange, OrderTimeline, ORDER_STEPS } from '@/features/orders';
import { resolveAssetUrl } from '@/services/apiClient';
import { changePassword, getMyOrders, updateProfile } from '@/services/authApi';
import forms from '@/styles/forms.module.css';
import { cn } from '@/utils/cn';
import { formatOrientation, matSuffix } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import styles from './AccountPage.module.css';

const PAYMENT_LABELS = { cod: 'Cash on delivery', bank: 'Bank transfer / JazzCash / Easypaisa' };
const DAY_MS = 86_400_000;

/** Field errors from an API error's details, by field name. */
const fieldErrorsOf = (error) => Object.fromEntries((Array.isArray(error?.details) ? error.details : []).map((detail) => [detail.field, detail.message]));

/** /account — sign in or create an account; signed in, the customer's orders, details and password. */
export default function AccountPage() {
  const { user, status } = useAuth();

  return (
    <>
      <title>{`Your account | ${SITE.name}`}</title>
      <meta name="description" content="Sign in to Zauq Frames to see your orders and their status, and to check out faster with your saved details." />
      {status === 'loading' ? <PageHero size="sm" breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Account' }]} title="Your" titleLight="account" lead="One moment…" /> : user ? <Dashboard /> : <SignIn />}
    </>
  );
}

/* ---------- Signed out ---------- */

function SignIn() {
  const id = useId();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [state, setState] = useState({ busy: false, error: '', errors: {} });
  const next = searchParams.get('next')?.startsWith('/') ? searchParams.get('next') : null;

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const switchMode = (value) => {
    setMode(value);
    setState({ busy: false, error: '', errors: {} });
  };

  const submit = async (event) => {
    event.preventDefault();
    setState({ busy: true, error: '', errors: {} });
    try {
      if (mode === 'signin') await signIn({ email: form.email, password: form.password });
      else await signUp({ name: form.name, email: form.email, password: form.password, ...(form.phone.trim() ? { phone: form.phone } : {}) });
      if (next) navigate(next, { replace: true });
    } catch (error) {
      const errors = fieldErrorsOf(error);
      setState({ busy: false, error: Object.keys(errors).length ? '' : error.message, errors });
    }
  };

  const fieldClass = (field) => cn(forms.field, state.errors[field] && forms.invalid);
  const fieldError = (field) =>
    state.errors[field] && (
      <p className={forms.error} role="alert">
        {state.errors[field]}
      </p>
    );

  const card = (
    <div className={styles.authCard}>
      <div className={styles.segments} role="tablist" aria-label="Sign in or create an account">
        {[
          ['signin', 'Sign in'],
          ['signup', 'Create account'],
        ].map(([value, label]) => (
          <button key={value} type="button" role="tab" aria-selected={mode === value} className={cn(styles.segment, mode === value && styles.segmentOn)} onClick={() => switchMode(value)}>
            {label}
          </button>
        ))}
      </div>

      <form className={forms.stack} onSubmit={submit} noValidate>
        {mode === 'signup' && (
          <div className={fieldClass('name')}>
            <label htmlFor={`${id}-name`} className={forms.label}>
              Full name
            </label>
            <input id={`${id}-name`} className={forms.input} value={form.name} onChange={set('name')} autoComplete="name" required />
            {fieldError('name')}
          </div>
        )}
        <div className={fieldClass('email')}>
          <label htmlFor={`${id}-email`} className={forms.label}>
            Email
          </label>
          <input id={`${id}-email`} className={forms.input} type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" required />
          {fieldError('email')}
        </div>
        {mode === 'signup' && (
          <div className={fieldClass('phone')}>
            <label htmlFor={`${id}-phone`} className={forms.label}>
              Phone <span className={forms.hint}>Optional — for faster checkout</span>
            </label>
            <input id={`${id}-phone`} className={forms.input} type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="03xx xxxxxxx" />
            {fieldError('phone')}
          </div>
        )}
        <div className={fieldClass('password')}>
          <label htmlFor={`${id}-password`} className={forms.label}>
            Password {mode === 'signup' && <span className={forms.hint}>At least 8 characters</span>}
          </label>
          <input
            id={`${id}-password`}
            className={forms.input}
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={mode === 'signup' ? 8 : undefined}
            required
          />
          {fieldError('password')}
        </div>
        {state.error && (
          <p className={forms.alert} role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" size="lg" block disabled={state.busy}>
          {state.busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
        {mode === 'signin' && (
          <p className={styles.small}>
            Forgot your password?{' '}
            <a href={`${SITE.whatsappUrl}?text=${encodeURIComponent('Hi Zauq, I need help signing in to my account.')}`} target="_blank" rel="noopener noreferrer">
              Message us on WhatsApp
            </a>
          </p>
        )}
        <p className={styles.small}>
          No account needed to order. <Link to={ROUTES.trackOrder}>Track an order as a guest →</Link>
        </p>
      </form>
    </div>
  );

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Account' }]}
        kicker="Your account"
        title={mode === 'signin' ? 'Welcome' : 'Create your'}
        titleLight={mode === 'signin' ? 'back.' : 'account.'}
        lead="Sign in to see every order and where it is, and to check out faster with your details saved."
        media={<AccountPeek>{card}</AccountPeek>}
      >
        <ul className={styles.benefits}>
          <li>
            <BagIcon size={20} />
            <span>
              <strong>Order history</strong>
              Every frame you’ve ordered, with its status.
            </span>
          </li>
          <li>
            <TruckIcon size={20} />
            <span>
              <strong>Live tracking</strong>
              From confirmed to framed, shipped and delivered.
            </span>
          </li>
          <li>
            <ClockIcon size={20} />
            <span>
              <strong>Faster checkout</strong>
              Your address and phone, filled in for you.
            </span>
          </li>
        </ul>
      </PageHero>
    </>
  );
}

/* ---------- Signed in ---------- */

const TABS = [
  ['orders', 'Orders'],
  ['details', 'Details'],
  ['password', 'Password'],
];

function Dashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState({ status: 'loading', items: [] });
  const firstName = user.name.trim().split(' ')[0];

  useEffect(() => {
    const controller = new AbortController();
    getMyOrders({ signal: controller.signal })
      .then((data) => setOrders({ status: 'success', items: data.items }))
      .catch((error) => {
        if (error.name !== 'AbortError') setOrders({ status: 'error', items: [] });
      });
    return () => controller.abort();
  }, []);

  const active = orders.items.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length;

  return (
    <>
      <PageHero
        size="sm"
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Account' }]}
        kicker="Your account"
        title="Hello,"
        titleLight={`${firstName}.`}
        lead={`Signed in as ${user.email}. Your orders, saved details and password, in one place.`}
        actions={
          <>
            <Button to={ROUTES.shop}>Shop the collection</Button>
            <Button variant="secondary" onClick={signOut}>
              Sign out
            </Button>
          </>
        }
      >
        <dl className={styles.stats}>
          <div>
            <dt>Orders</dt>
            <dd>{orders.status === 'success' ? orders.items.length : '–'}</dd>
          </div>
          <div>
            <dt>In progress</dt>
            <dd>{orders.status === 'success' ? active : '–'}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{formatDay(user.createdAt)}</dd>
          </div>
        </dl>
      </PageHero>

      <Container className={styles.body}>
        <div className={styles.tabs} role="tablist" aria-label="Account sections">
          {TABS.map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value} className={cn(styles.tab, tab === value && styles.tabOn)} onClick={() => setTab(value)}>
              {label}
            </button>
          ))}
        </div>

        <div className={styles.panel} role="tabpanel">
          {tab === 'orders' && <Orders state={orders} />}
          {tab === 'details' && <Details />}
          {tab === 'password' && <Password />}
        </div>
      </Container>
    </>
  );
}

function Orders({ state }) {
  const [open, setOpen] = useState(null);

  if (state.status === 'loading') return <p className={styles.muted}>Loading your orders…</p>;
  if (state.status === 'error') return <p className={forms.alert}>We couldn’t load your orders. Please refresh the page.</p>;
  if (!state.items.length) {
    return (
      <div className={styles.emptyOrders}>
        <h2>No orders yet</h2>
        <p>When you order while signed in, it appears here with its status.</p>
        <Button to={ROUTES.shop}>Find your first piece</Button>
      </div>
    );
  }

  return (
    <ul className={styles.orders}>
      {state.items.map((order) => {
        const expanded = open === order.id;
        const step = ORDER_STEPS.find((entry) => entry.status === order.status);
        const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const placed = Date.parse(order.createdAt);
        return (
          <li key={order.id} className={styles.order}>
            <button type="button" className={styles.orderHead} aria-expanded={expanded} onClick={() => setOpen(expanded ? null : order.id)}>
              <span className={styles.thumbs} aria-hidden="true">
                {order.items.slice(0, 3).map((item, index) => (
                  <img key={index} src={item.image ?? resolveAssetUrl(item.photoUrl)} alt="" />
                ))}
              </span>
              <span className={styles.orderText}>
                <strong>{order.id}</strong>
                <span>
                  {formatDay(order.createdAt)} · {count} {count === 1 ? 'frame' : 'frames'} · {formatPrice(order.total, order.currency)}
                </span>
              </span>
              <span className={cn(styles.status, order.status === 'delivered' && styles.statusDone, order.status === 'cancelled' && styles.statusCancelled)}>
                {order.status === 'cancelled' ? 'Cancelled' : step?.label}
              </span>
              <ChevronDownIcon size={18} className={cn(styles.chevron, expanded && styles.chevronOpen)} />
            </button>

            {expanded && (
              <div className={styles.orderBody}>
                {order.status !== 'cancelled' && <OrderTimeline status={order.status} history={order.history} />}
                <div className={styles.orderGrid}>
                  <ul className={styles.lines}>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        <img src={item.image ?? resolveAssetUrl(item.photoUrl)} alt="" />
                        <span>
                          <strong>{item.name}</strong>
                          {item.label} · {formatOrientation(item.orientation)}
                          {matSuffix(item.mat)} · × {item.quantity}
                        </span>
                        <span>{formatPrice(item.lineTotal, order.currency)}</span>
                      </li>
                    ))}
                  </ul>
                  <dl className={styles.facts}>
                    <div>
                      <dt>Estimated delivery</dt>
                      <dd>{order.status === 'delivered' ? 'Delivered' : formatDayRange(new Date(placed + 7 * DAY_MS).toISOString(), new Date(placed + 10 * DAY_MS).toISOString())}</dd>
                    </div>
                    <div>
                      <dt>Ships to</dt>
                      <dd>
                        {order.customer.name}, {order.customer.address}, {order.customer.city}
                      </dd>
                    </div>
                    <div>
                      <dt>Payment</dt>
                      <dd>{PAYMENT_LABELS[order.paymentMethod] ?? PAYMENT_LABELS.cod}</dd>
                    </div>
                    <div>
                      <dt>Total</dt>
                      <dd>
                        {formatPrice(order.total, order.currency)} <span className={styles.muted}>incl. {formatPrice(order.deliveryFee, order.currency)} delivery</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Details() {
  const id = useId();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: user.name ?? '', phone: user.phone ?? '', address: user.address ?? '', city: user.city ?? '' });
  const [state, setState] = useState({ busy: false, errors: {}, error: '' });
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setState({ busy: true, errors: {}, error: '' });
    try {
      const data = await updateProfile(form);
      updateUser(data.user);
      setState({ busy: false, errors: {}, error: '' });
      showToast('Your details are saved.');
    } catch (error) {
      const errors = fieldErrorsOf(error);
      setState({ busy: false, errors, error: Object.keys(errors).length ? '' : error.message });
    }
  };

  const field = (name, label, props = {}) => (
    <div className={cn(forms.field, state.errors[name] && forms.invalid)}>
      <label htmlFor={`${id}-${name}`} className={forms.label}>
        {label}
      </label>
      <input id={`${id}-${name}`} className={forms.input} value={form[name]} onChange={set(name)} {...props} />
      {state.errors[name] && <p className={forms.error}>{state.errors[name]}</p>}
    </div>
  );

  return (
    <form className={cn(forms.stack, styles.narrow)} onSubmit={submit} noValidate>
      <h2 className={styles.panelTitle}>Your details</h2>
      <p className={styles.muted}>Saved here, they’re filled in for you at checkout.</p>
      <div className={forms.field}>
        <label htmlFor={`${id}-email`} className={forms.label}>
          Email
        </label>
        <input id={`${id}-email`} className={forms.input} value={user.email} readOnly />
      </div>
      <div className={forms.row}>
        {field('name', 'Full name', { autoComplete: 'name' })}
        {field('phone', 'Phone or WhatsApp', { type: 'tel', autoComplete: 'tel' })}
      </div>
      {field('address', 'Delivery address', { autoComplete: 'street-address' })}
      {field('city', 'City', { autoComplete: 'address-level2' })}
      {state.error && <p className={forms.alert}>{state.error}</p>}
      <div>
        <Button type="submit" disabled={state.busy}>
          {state.busy ? 'Saving…' : 'Save details'}
        </Button>
      </div>
    </form>
  );
}

function Password() {
  const id = useId();
  const { showToast } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [state, setState] = useState({ busy: false, errors: {}, error: '' });
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirm) {
      setState({ busy: false, errors: { confirm: 'The two new passwords don’t match.' }, error: '' });
      return;
    }
    setState({ busy: true, errors: {}, error: '' });
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setState({ busy: false, errors: {}, error: '' });
      showToast('Password changed. Other devices have been signed out.');
    } catch (error) {
      const errors = fieldErrorsOf(error);
      setState({ busy: false, errors, error: Object.keys(errors).length ? '' : error.message });
    }
  };

  const field = (name, label, autoComplete) => (
    <div className={cn(forms.field, state.errors[name] && forms.invalid)}>
      <label htmlFor={`${id}-${name}`} className={forms.label}>
        {label}
      </label>
      <input id={`${id}-${name}`} className={forms.input} type="password" value={form[name]} onChange={set(name)} autoComplete={autoComplete} required />
      {state.errors[name] && <p className={forms.error}>{state.errors[name]}</p>}
    </div>
  );

  return (
    <form className={cn(forms.stack, styles.narrow)} onSubmit={submit} noValidate>
      <h2 className={styles.panelTitle}>Change password</h2>
      <p className={styles.muted}>Use at least 8 characters. Changing it signs you out on other devices.</p>
      {field('currentPassword', 'Current password', 'current-password')}
      {field('newPassword', 'New password', 'new-password')}
      {field('confirm', 'New password again', 'new-password')}
      {state.error && <p className={forms.alert}>{state.error}</p>}
      <div>
        <Button type="submit" disabled={state.busy}>
          {state.busy ? 'Saving…' : 'Change password'}
        </Button>
      </div>
    </form>
  );
}
