/**
 * Search titles and descriptions for products and collections, shared by the
 * server-rendered pages (seo.js) and the shop API, so both always say the same.
 */
const SITE_NAME = 'Zauq Frames';

/** How each collection's pieces are described in titles (an admin can override per product). */
export const NOUN = {
  'islamic-calligraphy': 'Islamic Calligraphy Frame',
  'modern-minimal': 'Framed Wall Art',
  'art-culture': 'Framed Poster',
  'heritage-pakistan': 'Framed Heritage Art',
};
export const COLLECTION_TITLE = {
  'islamic-calligraphy': 'Islamic Calligraphy Frames in Pakistan',
  'modern-minimal': 'Modern Wall Art Frames in Pakistan',
  'art-culture': 'Framed Posters & Art Prints in Pakistan',
  'heritage-pakistan': 'Heritage Pakistan Art Prints, Framed',
};

export const rs = (n) => Number(n).toLocaleString('en-PK');
export const clip = (text, max = 160) => {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

/** A product's search title and description (the admin's SEO fields win when filled in). */
export function productSeo(product, catalog) {
  const min = Math.min(...catalog.sizes.map((s) => s.salePrice));
  const max = Math.max(...catalog.sizes.map((s) => s.salePrice));
  const title = product.seo?.metaTitle || `${product.name} ${NOUN[product.collection] ?? 'Framed Art'} | ${SITE_NAME}`;
  const description =
    product.seo?.metaDescription ||
    clip(`${product.summary} Black frame with a free white mat, ${catalog.sizes.length} sizes from Rs ${rs(min)} to Rs ${rs(max)}. Made to order in Rawalpindi; Rs ${rs(catalog.deliveryFee)} delivery anywhere in Pakistan, cash on delivery.`);
  return { title, description };
}

export function collectionSeo(collection, catalog) {
  const min = Math.min(...catalog.sizes.map((s) => s.salePrice));
  const title = collection.seo?.metaTitle || `${COLLECTION_TITLE[collection.slug] ?? `${collection.name} Frames in Pakistan`} – From Rs ${rs(min)} | ${SITE_NAME}`;
  const description = collection.seo?.metaDescription || clip(`${collection.description} Framed in black with a free white mat, six sizes from Rs ${rs(min)}. Delivered anywhere in Pakistan.`);
  return { title, description };
}

