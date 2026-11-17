import { collectionPath, ROUTES } from './routes.js';

/**
 * The Support dropdown in the header (and its section in the mobile menu).
 * `icon` names an icon from MainNav's NAV_ICONS.
 */
export const SUPPORT_NAV = Object.freeze([
  { label: 'Contact', to: ROUTES.contact, icon: 'mail' },
  { label: 'FAQ', to: ROUTES.faqs, icon: 'help' },
  { label: 'About Us', to: ROUTES.about, icon: 'info' },
  { label: 'Sizes', to: `${ROUTES.home}#sizes`, icon: 'ruler' },
  { label: 'Blog', to: ROUTES.blog, icon: 'book' },
]);

/**
 * Header navigation. `group` splits the desktop category row into shop links
 * and services; `icon` names an icon from MainNav's ICONS; `highlight` shows
 * the link as a pill; `children` makes the item a dropdown.
 */
export const MAIN_NAV = Object.freeze([
  { label: 'Shop all', to: ROUTES.shop, end: true, group: 'shop' },
  { label: 'Calligraphy', to: collectionPath('islamic-calligraphy'), group: 'shop' },
  { label: 'Modern', to: collectionPath('modern-minimal'), group: 'shop' },
  { label: 'Art & Culture', to: collectionPath('art-culture'), group: 'shop' },
  { label: 'Heritage', to: collectionPath('heritage-pakistan'), group: 'shop' },
  { label: 'Custom frames', to: ROUTES.customFrames, group: 'services', icon: 'image', highlight: true },
  { label: 'Support', group: 'services', children: SUPPORT_NAV },
]);

/** Quick searches offered when the search panel opens. Each should match at least one product. */
export const POPULAR_SEARCHES = Object.freeze(['Bismillah', 'Kufic', 'Gold', 'Sunset', 'Abstract', 'Samurai']);

/** Small links in the top bar and the mobile menu. */
export const UTILITY_NAV = Object.freeze([
  { label: 'Track order', to: ROUTES.trackOrder },
  { label: 'Help', to: ROUTES.faqs },
]);

export const FOOTER_NAV = Object.freeze([
  {
    title: 'Shop',
    links: [
      { label: 'Islamic Calligraphy', to: collectionPath('islamic-calligraphy') },
      { label: 'Modern & Minimal', to: collectionPath('modern-minimal') },
      { label: 'Art & Culture', to: collectionPath('art-culture') },
      { label: 'Heritage Pakistan', to: collectionPath('heritage-pakistan') },
      { label: 'Custom Frames', to: ROUTES.customFrames },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track your order', to: ROUTES.trackOrder },
      { label: 'Shipping & delivery', to: ROUTES.shipping },
      { label: 'Returns & exchanges', to: ROUTES.returns },
      { label: 'FAQs', to: ROUTES.faqs },
      { label: 'Frame sizes', to: `${ROUTES.home}#sizes` },
      { label: 'Care guide', to: ROUTES.care },
      { label: 'Contact us', to: ROUTES.contact },
      { label: 'About us', to: ROUTES.about },
      { label: 'Craftsmanship', to: ROUTES.craftsmanship },
      { label: 'Blog', to: ROUTES.blog },
    ],
  },
]);

export const LEGAL_LINKS = Object.freeze([
  { label: 'Terms & Conditions', to: ROUTES.terms },
  { label: 'Privacy Policy', to: ROUTES.privacy },
  { label: 'Refund Policy', to: ROUTES.refunds },
]);
