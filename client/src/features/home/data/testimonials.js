/**
 * Customer reviews shown on the home page. Add real ones here — with the
 * customer's permission — and delete the samples.
 *
 * `sample: true` entries are placeholders for the layout: they appear while
 * developing (tagged "Sample") and are left out of the live site, so made-up
 * reviews are never published. The section hides itself when no real reviews
 * are left.
 *
 * @typedef {{ quote: string, name: string, city: string, piece?: { name: string, slug: string }, sample?: boolean }} Testimonial
 * @type {readonly Testimonial[]}
 */
export const TESTIMONIALS = Object.freeze([
  {
    quote: 'Replace with a real review — e.g. how the frame looked when it arrived and where it hangs now.',
    name: 'Sample customer',
    city: 'Lahore',
    piece: { name: 'Tawakkul · Sabr · Shukr', slug: 'tawakkul-sabr-shukr' },
    sample: true,
  },
  {
    quote: 'Replace with a real review of a custom photo frame — the photo, the size chosen and how it turned out.',
    name: 'Sample customer',
    city: 'Islamabad',
    sample: true,
  },
  {
    quote: 'Replace with a real review about packing and delivery — how long it took and the condition it arrived in.',
    name: 'Sample customer',
    city: 'Karachi',
    piece: { name: 'Sunset Peaks', slug: 'sunset-peaks' },
    sample: true,
  },
]);
