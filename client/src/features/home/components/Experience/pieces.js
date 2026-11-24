import { collectionPath, productPath, ROUTES } from '@/config/routes';

/**
 * The five frames in the home hero — one per category, like a salon wall in
 * 3D. `aspect` is width ÷ height of the framed piece; `word` is the giant
 * word behind the frame. `image` is the flat artwork (null = the "your photo
 * here" placeholder, drawn in code).
 */
export const PIECES = Object.freeze([
  {
    key: 'modern-minimal',
    word: 'Modern',
    label: 'Modern & Minimal',
    piece: 'Vinyl Dance',
    image: '/images/hero/3d/vinyl-dance.jpg',
    aspect: 3 / 4,
    primary: { label: 'Shop Modern & Minimal', to: collectionPath('modern-minimal') },
    secondary: { label: 'View Vinyl Dance', to: productPath('vinyl-dance') },
  },
  {
    key: 'islamic-calligraphy',
    word: 'Calligraphy',
    label: 'Islamic Calligraphy',
    piece: 'Ud’uni Astajib Lakum',
    image: '/images/hero/3d/uduni-astajib-lakum.jpg',
    aspect: 3 / 4,
    primary: { label: 'Shop Calligraphy', to: collectionPath('islamic-calligraphy') },
    secondary: { label: 'View Ud’uni Astajib Lakum', to: productPath('uduni-astajib-lakum') },
  },
  {
    key: 'art-culture',
    word: 'Culture',
    label: 'Art & Culture',
    piece: 'Eminem',
    image: '/images/hero/3d/eminem.jpg',
    aspect: 3 / 4,
    primary: { label: 'Shop Art & Culture', to: collectionPath('art-culture') },
    secondary: { label: 'View Eminem', to: productPath('eminem') },
  },
  {
    key: 'heritage-pakistan',
    word: 'Heritage',
    label: 'Heritage Pakistan',
    piece: 'Badshahi Mosque',
    image: '/images/hero/3d/badshahi-mosque.jpg',
    aspect: 4 / 3,
    primary: { label: 'Shop Heritage Pakistan', to: collectionPath('heritage-pakistan') },
    secondary: { label: 'View Badshahi Mosque', to: productPath('badshahi-mosque') },
  },
  {
    key: 'custom',
    word: 'Custom',
    label: 'Custom frames',
    piece: 'Your photo, framed',
    image: null,
    aspect: 3 / 4,
    primary: { label: 'Frame your photo', to: ROUTES.customFrames },
    secondary: { label: 'See how it works', to: `${ROUTES.customFrames}#how` },
  },
]);

/**
 * Numbers the page and the 3D scene (scene.js) must agree on, so the page can
 * work out how big the frame will be before it lays the text out around it.
 */
export const VIEW = Object.freeze({
  /** Camera: field of view in degrees, and its distance from the frames. */
  fov: 30,
  distance: 7.5,
  /** Long side of a frame, in world units. */
  long: 2,
  /** The front frame at its largest in the story (the first chapter zooms in). */
  zoom: 1.12,
  /** Small screens: the most of the stage width one world unit may take, and the largest scale. */
  perWidth: 0.4,
  maxScale: 0.9,
});

/** How much of the world the camera sees from top to bottom, at the frames. */
export const VIEW_HEIGHT = 2 * Math.tan((VIEW.fov * Math.PI) / 360) * VIEW.distance;
