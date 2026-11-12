/** Brand and business details shown across the site. */
export const SITE = Object.freeze({
  name: 'Zauq Frames',
  fullName: 'Zauq Premium Frames',
  description: 'Framed wall art and custom photo frames, made to order in Rawalpindi.',
  address: 'Rawalpindi, Pakistan',
  hours: 'Mon–Sat · 9 am – 6 pm',
  leadTime: '7–12 working days',
  email: 'zauqframes.store@gmail.com',
  phone: { display: '0323 5992853', href: 'tel:+923235992853' },
  whatsappUrl: 'https://wa.me/923235992853',
  instagram: { handle: '@zauqframes', href: 'https://www.instagram.com/zauqframes/' },
  facebookUrl: 'https://www.facebook.com/profile.php?id=61593836891740',
  foundedYear: 2026,
});

/** A WhatsApp chat link with a pre-filled message. */
export const whatsappLink = (message) => `${SITE.whatsappUrl}?text=${encodeURIComponent(message)}`;
