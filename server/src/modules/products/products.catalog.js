/**
 * Collections and products shown in the shop. Every piece is available in
 * every frame size at one price (PRODUCT_PRICE in frames.catalog.js). This moves into the database once one is chosen; only
 * `products.service.js` reads it directly.
 *
 * Images live in client/public/images. `badge` is an optional short label
 * shown on product cards (e.g. 'New' or 'Bestseller'); leave it null if unsure.
 */

const room = (slug) => `/images/products/${slug}-room.jpg`;
const flat = (slug) => `/images/products/${slug}-flat.jpg`;
const FRAME_CORNER = '/images/site/frame-corner.jpg';

export const COLLECTIONS = Object.freeze([
  {
    slug: 'islamic-calligraphy',
    name: 'Islamic Calligraphy',
    shortName: 'Calligraphy',
    description: 'Timeless Arabic calligraphy — from a classic Bismillah to geometric Kufic — set among traditional patterns and gold illumination.',
    image: room('tawakkul-sabr-shukr'),
  },
  {
    slug: 'modern-minimal',
    name: 'Modern & Minimal',
    shortName: 'Modern',
    description: 'Soft, earthy palettes and contemporary forms, curated for calm, modern spaces.',
    image: room('botanical-abstract'),
  },
  {
    slug: 'art-culture',
    name: 'Art & Culture',
    shortName: 'Art & Culture',
    description: 'Bold, expressive pieces inspired by street art, music, sport and film.',
    image: room('dream-big'),
  },
]);

export const PRODUCTS = Object.freeze([
  // Islamic Calligraphy
  {
    slug: 'tawakkul-sabr-shukr',
    name: 'Tawakkul · Sabr · Shukr',
    collection: 'islamic-calligraphy',
    summary: 'Trust in Allah, Patience and Gratitude in white calligraphy on deep red.',
    description: 'Three virtues — Tawakkul, Sabr and Shukr — written in flowing white script with their English meanings, set against deep red beside a traditional geometric border. A calm, meaningful piece for receptions, offices and homes.',
    images: [room('tawakkul-sabr-shukr'), flat('tawakkul-sabr-shukr'), FRAME_CORNER],
    featured: true,
    badge: null,
  },
  {
    slug: 'black-and-gold',
    name: 'Black & Gold',
    collection: 'islamic-calligraphy',
    summary: 'A calligraphy panel framed by ornate gold illumination on black.',
    description: 'A calligraphy panel within ornate gold illumination on black, inspired by manuscript borders. Formal and rich — made for boardrooms, executive offices and feature walls.',
    images: [room('black-and-gold'), flat('black-and-gold'), FRAME_CORNER],
    featured: true,
    badge: null,
  },
  {
    slug: 'bismillah',
    name: 'Bismillah',
    collection: 'islamic-calligraphy',
    summary: 'Bismillah in flowing script beside a woven red border and dried florals.',
    description: 'Bismillah ir-Rahman ir-Rahim in flowing black script on warm cream, beside a woven red border and delicate dried florals. A gentle, welcoming piece for entrances and living spaces.',
    images: [room('bismillah'), flat('bismillah'), FRAME_CORNER],
    featured: false,
    badge: null,
  },
  {
    slug: 'uduni-astajib-lakum',
    name: 'Ud’uni Astajib Lakum',
    collection: 'islamic-calligraphy',
    summary: '“Call upon Me; I will respond to you” in circular script on layered blue.',
    description: '“Call upon Me; I will respond to you.” A circular composition in white script within layered tones of blue — calm, reflective and striking on any wall.',
    images: [room('uduni-astajib-lakum'), flat('uduni-astajib-lakum'), FRAME_CORNER],
    featured: false,
    badge: null,
  },
  {
    slug: 'ma-tawfiqi-illa-billah',
    name: 'Ma Tawfiqi Illa Billah',
    collection: 'islamic-calligraphy',
    summary: '“My success is only by Allah” between fields of teal and soft florals.',
    description: '“My success is only by Allah.” Calligraphy on a cream panel between fields of teal and soft florals — a fitting piece for offices, new ventures and thoughtful gifts.',
    images: [room('ma-tawfiqi-illa-billah'), flat('ma-tawfiqi-illa-billah'), FRAME_CORNER],
    featured: false,
    badge: null,
  },
  {
    slug: 'square-kufic',
    name: 'Square Kufic',
    collection: 'islamic-calligraphy',
    summary: 'Geometric Kufic script in warm copper tones on black.',
    description: 'Geometric Kufic script in warm copper tones on black. Architectural and modern, it suits contemporary interiors, minimal walls and executive spaces.',
    images: [room('square-kufic'), flat('square-kufic'), FRAME_CORNER],
    featured: true,
    badge: null,
  },

  // Modern & Minimal
  {
    slug: 'sunset-peaks',
    name: 'Sunset Peaks',
    collection: 'modern-minimal',
    summary: 'Layered mountains and a low orange sun in soft, earthy tones.',
    description: 'Layered mountains, a low orange sun and a line of birds in soft, earthy tones. Calming and easy to place — in a lounge, meeting room or bedroom.',
    images: [room('sunset-peaks'), '/images/site/hero-sunset.jpg', FRAME_CORNER],
    featured: true,
    badge: null,
  },
  {
    slug: 'colour-town',
    name: 'Colour Town',
    collection: 'modern-minimal',
    summary: 'Sun-washed houses stacked in vivid reds, ochres and blues.',
    description: 'Sun-washed houses stacked in vivid reds, ochres and blues. Bright and optimistic — a focal point for open, light-filled spaces.',
    images: [room('colour-town'), FRAME_CORNER],
    featured: true,
    badge: null,
  },
  {
    slug: 'botanical-abstract',
    name: 'Botanical Abstract',
    collection: 'modern-minimal',
    summary: 'Organic shapes and a single leaf in terracotta, sand and black.',
    description: 'Organic shapes and a single leaf in terracotta, sand and black. Warm, understated and quietly elegant.',
    images: [room('botanical-abstract'), FRAME_CORNER],
    featured: false,
    badge: null,
  },
  {
    slug: 'flowing-curves',
    name: 'Flowing Curves',
    collection: 'modern-minimal',
    summary: 'Bold curves in navy, rust and ochre, traced with a fine line.',
    description: 'Bold curves in navy, rust and ochre, traced with a single fine line. Contemporary and confident.',
    images: [room('flowing-curves'), FRAME_CORNER],
    featured: true,
    badge: null,
  },
  {
    slug: 'deer-motif',
    name: 'Deer Motif',
    collection: 'modern-minimal',
    summary: 'A graphic deer emblem in deep navy on warm cream.',
    description: 'A graphic deer emblem in deep navy on warm cream — striking, symmetrical and modern.',
    images: [room('deer-motif'), FRAME_CORNER],
    featured: false,
    badge: null,
  },
  {
    slug: 'vinyl-dance',
    name: 'Vinyl Dance',
    collection: 'modern-minimal',
    summary: 'A pair dancing on a spinning record — playful and retro.',
    description: 'A pair dancing on a spinning record — playful, retro and full of warmth. Ideal for social spaces and creative studios.',
    images: [room('vinyl-dance'), '/images/site/hero-vinyl-dark.jpg', FRAME_CORNER],
    featured: false,
    badge: null,
  },

  // Art & Culture
  {
    slug: 'dream-big',
    name: 'Dream Big',
    collection: 'art-culture',
    summary: 'A street-art astronaut in neon tones, layered with graffiti.',
    description: 'A street-art astronaut in neon pinks and blues, layered with graffiti and texture. Energy and personality for studios, gyms and breakout spaces.',
    images: [room('dream-big'), FRAME_CORNER],
    featured: true,
    badge: null,
  },
  {
    slug: 'the-samurai',
    name: 'The Samurai',
    collection: 'art-culture',
    summary: 'An ink-wash warrior beneath a red sun, in striking monochrome.',
    description: 'An ink-wash warrior beneath a red sun, rendered in striking monochrome.',
    images: [room('the-samurai'), FRAME_CORNER],
    featured: false,
    badge: null,
  },
  {
    slug: 'cassette-culture',
    name: 'Cassette Culture',
    collection: 'art-culture',
    summary: 'A collage tribute to mixtapes and late-night playlists.',
    description: 'A collage tribute to mixtapes, playlists and late-night music.',
    images: [room('cassette-culture'), FRAME_CORNER],
    featured: false,
    badge: null,
  },
  {
    slug: 'sunset-dunk',
    name: 'Sunset Dunk',
    collection: 'art-culture',
    summary: 'A basketball silhouette against a burning city sunset.',
    description: 'A basketball silhouette against a burning orange city sunset.',
    images: [room('sunset-dunk'), FRAME_CORNER],
    featured: false,
    badge: null,
  },
]);
