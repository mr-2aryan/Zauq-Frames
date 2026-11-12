/** Every URL in the app. Import from here instead of hard-coding paths. */
export const ROUTES = Object.freeze({
  home: '/',
  business: '/#business',
  shop: '/shop',
  customFrames: '/custom-frames',
  cart: '/cart',
  about: '/about',
  craftsmanship: '/craftsmanship',
  contact: '/contact',
  account: '/account',
  faqs: '/help',
  shipping: '/help/shipping',
  returns: '/help/returns',
  trackOrder: '/help/track-order',
  care: '/help/care',
  terms: '/legal/terms',
  privacy: '/legal/privacy',
  refunds: '/legal/refunds',
});

export const collectionPath = (slug) => `/collections/${slug}`;
export const productPath = (slug) => `/products/${slug}`;

/** Shop URL for a search, a set of collections and a sort order. */
export function shopPath({ q = '', categories = [], sort = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (categories.length) params.set('category', categories.join(','));
  if (sort && sort !== 'featured') params.set('sort', sort);
  const query = params.toString();
  return query ? `${ROUTES.shop}?${query}` : ROUTES.shop;
}

/**
 * Pages linked from the header/footer that have no content yet.
 * Each renders a "coming soon" placeholder until its real page is built —
 * then move it into `src/app/router.jsx` with its own component.
 */
export const UPCOMING_PAGES = Object.freeze([
  { path: ROUTES.about, title: 'Our Story' },
  { path: ROUTES.craftsmanship, title: 'Craftsmanship' },
  { path: ROUTES.contact, title: 'Contact us' },
  { path: ROUTES.account, title: 'Your account' },
  { path: ROUTES.faqs, title: 'FAQs' },
  { path: ROUTES.shipping, title: 'Shipping & Delivery' },
  { path: ROUTES.returns, title: 'Returns & Exchanges' },
  { path: ROUTES.trackOrder, title: 'Track Your Order' },
  { path: ROUTES.care, title: 'Care Guide' },
  { path: ROUTES.terms, title: 'Terms & Conditions' },
  { path: ROUTES.privacy, title: 'Privacy Policy' },
  { path: ROUTES.refunds, title: 'Refund Policy' },
]);
