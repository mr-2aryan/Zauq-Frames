/** Static copy for the Custom Frames page. Prices and sizes come from the API. */

export const HERO_HIGHLIGHTS = Object.freeze([
  { label: 'Made to order', value: 'Cut for your image' },
  { label: 'Five sizes', value: '8×10 up to 24×36' },
  { label: 'Nationwide', value: 'Packed safely' },
]);

export const HOW_IT_WORKS_STEPS = Object.freeze([
  { title: 'Upload your image', text: 'Choose a clear, high-quality photo, artwork or design.' },
  { title: 'Select your frame size', text: 'Pick the size that suits your wall and interior.' },
  { title: 'Place your order', text: 'Our team prepares your custom frame once you order.' },
  { title: 'We create and deliver', text: 'Professionally framed, securely packed, delivered to your door.' },
]);

/** `tilt` is in degrees; `tone` maps to a chip colour in Occasions.module.css. */
export const OCCASIONS = Object.freeze([
  { label: 'Family photos', tone: 'coral', tilt: -3 },
  { label: 'Wedding memories', tone: 'sage', tilt: 2 },
  { label: 'Travel moments', tone: 'paper', tilt: 0 },
  { label: 'Calligraphy', tone: 'olive', tilt: -1.5 },
  { label: 'Original designs', tone: 'paper', tilt: 3 },
]);

export const PHOTO_RULES = Object.freeze({
  acceptedTypes: ['image/jpeg', 'image/png'],
  accept: 'image/jpeg,image/png',
  maxMb: 20,
});
