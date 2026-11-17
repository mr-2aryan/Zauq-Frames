/** Blog URLs (the routes are registered in app/router.jsx). */
export const BLOG_PATH = '/blog';
export const blogPostPath = (slug) => `${BLOG_PATH}/${slug}`;

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** `16 November 2026` */
export const formatPostDate = (iso) => dateFormat.format(new Date(`${iso}T12:00:00`));

/** An anchor id for a heading: "Mind the crop" → "mind-the-crop". */
export const headingId = (text) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
