/** Static copy for the Custom Frames page. Prices and sizes come from the API. */

export const HERO_HIGHLIGHTS = Object.freeze([
  { label: 'Made to order', value: 'Cut for your image' },
  { label: 'Six sizes', value: '8×10 up to 36×48' },
  { label: 'Nationwide', value: 'Packed safely' },
]);

export const HOW_IT_WORKS_STEPS = Object.freeze([
  { title: 'Upload your image', text: 'Choose a clear, high-quality photo, artwork or design.' },
  { title: 'Select your frame size', text: 'Pick the size that suits your wall and interior.' },
  { title: 'Place your order', text: 'Our team prepares your custom frame once you order.' },
  { title: 'We create and deliver', text: 'Professionally framed, securely packed, delivered to your door.' },
]);

/** `tilt` is in degrees; `tone` maps to a chip colour in Occasions.module.css. */
/** What people frame — `icon` names one of Occasions' icons; `sizes` is a suggestion, not a rule. */
export const OCCASIONS = Object.freeze([
  { label: 'Family photos', icon: 'family', tone: 'coral', text: 'Portraits, Eid mornings, three generations in one frame.', sizes: '16 × 20 or 18 × 24 in' },
  { label: 'Wedding memories', icon: 'wedding', tone: 'sage', text: 'The nikkah, the mehndi, the walima — your favourite moment from the day.', sizes: '18 × 24, 24 × 36 or 36 × 48 in' },
  { label: 'Travel moments', icon: 'travel', tone: 'sky', text: 'Northern peaks or a beach at sunset — the view you keep going back to.', sizes: 'Landscape, 24 × 18 in' },
  { label: 'Calligraphy', icon: 'calligraphy', tone: 'olive', text: 'A verse, a dua or a name written by hand, kept where you’ll see it every day.', sizes: '12 × 16 or 18 × 24 in' },
  { label: 'Original designs', icon: 'design', tone: 'paper', text: 'Your own artwork, illustration or design — printed and framed like a gallery piece.', sizes: 'Any of the six sizes' },
]);

export const PHOTO_RULES = Object.freeze({
  acceptedTypes: ['image/jpeg', 'image/png'],
  accept: 'image/jpeg,image/png',
  maxMb: 20,
});
