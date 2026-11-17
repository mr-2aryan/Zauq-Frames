/** Every URL in the app. Import from here instead of hard-coding paths. */
export const ROUTES = Object.freeze({
  home: '/',
  shop: '/shop',
  customFrames: '/custom-frames',
  cart: '/cart',
  checkout: '/checkout',
  orderConfirmation: '/order-confirmation',
  blog: '/blog',
  sizes: '/sizes',
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
export function shopPath({ q = '', categories = [], sort = '', page = 1 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (categories.length) params.set('category', categories.join(','));
  if (sort && sort !== 'featured') params.set('sort', sort);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `${ROUTES.shop}?${query}` : ROUTES.shop;
}

/**
 * Pages linked from the header/footer that have no content yet.
 * Each renders a "coming soon" placeholder until its real page is built —
 * then move it into `src/app/router.jsx` with its own component.
 */
export const UPCOMING_PAGES = Object.freeze([]);
