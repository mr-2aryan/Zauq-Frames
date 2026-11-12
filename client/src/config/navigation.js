import { collectionPath, ROUTES } from './routes.js';

export const MAIN_NAV = Object.freeze([
  { label: 'Shop all', to: ROUTES.shop, end: true },
  { label: 'Calligraphy', to: collectionPath('islamic-calligraphy') },
  { label: 'Modern', to: collectionPath('modern-minimal') },
  { label: 'Art & Culture', to: collectionPath('art-culture') },
  { label: 'Custom', to: ROUTES.customFrames },
  { label: 'Business', to: ROUTES.business },
]);

export const FOOTER_NAV = Object.freeze([
  {
    title: 'Shop',
    links: [
      { label: 'Islamic Calligraphy', to: collectionPath('islamic-calligraphy') },
      { label: 'Modern & Minimal', to: collectionPath('modern-minimal') },
      { label: 'Art & Culture', to: collectionPath('art-culture') },
      { label: 'Custom Frames', to: ROUTES.customFrames },
      { label: 'For Business', to: ROUTES.business },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track your order', to: ROUTES.trackOrder },
      { label: 'Shipping & delivery', to: ROUTES.shipping },
      { label: 'Returns & exchanges', to: ROUTES.returns },
      { label: 'FAQs', to: ROUTES.faqs },
      { label: 'Care guide', to: ROUTES.care },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our story', to: ROUTES.about },
      { label: 'Craftsmanship', to: ROUTES.craftsmanship },
      { label: 'Contact us', to: ROUTES.contact },
    ],
  },
]);

export const LEGAL_LINKS = Object.freeze([
  { label: 'Terms & Conditions', to: ROUTES.terms },
  { label: 'Privacy Policy', to: ROUTES.privacy },
  { label: 'Refund Policy', to: ROUTES.refunds },
]);
