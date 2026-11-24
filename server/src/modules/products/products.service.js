import { HttpError } from '../../utils/HttpError.js';
import { framesService } from '../frames/frames.service.js';
import { COLLECTIONS, PRODUCTS } from './products.catalog.js';

const SORTS = {
  featured: (a, b) => Number(b.featured) - Number(a.featured),
  'name-asc': (a, b) => a.name.localeCompare(b.name),
  'name-desc': (a, b) => b.name.localeCompare(a.name),
};
/** `random` returns a fresh shuffle on every request (used for the home page picks). */
export const SORT_OPTIONS = Object.freeze([...Object.keys(SORTS), 'random']);

/** Fisher–Yates shuffle of a copy. */
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const collectionBySlug = (slug) => COLLECTIONS.find((collection) => collection.slug === slug);

/** Pieces are priced by frame size; summaries carry the smallest size's price ("from"). */
async function productPrice() {
  const { currency, sizes } = await framesService.getCatalog();
  const cheapest = sizes.reduce((min, size) => (size.salePrice < min.salePrice ? size : min));
  return { currency, price: cheapest.price, salePrice: cheapest.salePrice };
}

const toSummary = (product, price) => ({
  slug: product.slug,
  name: product.name,
  collection: product.collection,
  collectionName: collectionBySlug(product.collection).name,
  summary: product.summary,
  orientation: product.orientation ?? 'portrait',
  image: product.cardImage ?? product.images[0],
  // A small picture of the artwork on its own, for thumbnails (null if there's none).
  art: product.art ?? null,
  featured: product.featured,
  badge: product.badge,
  ...price,
});

const matchesSearch = (product, terms) => {
  const haystack = `${product.name} ${collectionBySlug(product.collection).name} ${product.summary}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
};

export const productsService = {
  async listCollections() {
    return COLLECTIONS.map((collection) => ({
      ...collection,
      productCount: PRODUCTS.filter((product) => product.collection === collection.slug).length,
    }));
  },

  async getCollection(slug) {
    const collection = collectionBySlug(slug);
    if (!collection) throw HttpError.notFound('We could not find that collection.');
    return collection;
  },

  /**
   * `limit` is the page size; `page` (from 1) picks which page of results to return.
   * @param {{ collections?: string[], q?: string, sort?: string, featured?: boolean, limit?: number, page?: number }} options
   */
  async list({ collections = [], q = '', sort = 'featured', featured = false, limit, page = 1 } = {}) {
    const unknown = collections.find((slug) => !collectionBySlug(slug));
    if (unknown) throw HttpError.notFound(`We could not find the collection "${unknown}".`);

    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    let items = PRODUCTS.filter(
      (product) =>
        (!collections.length || collections.includes(product.collection)) &&
        (!featured || product.featured) &&
        (!terms.length || matchesSearch(product, terms)),
    );
    // Array.prototype.sort is stable, so equal items keep catalogue order.
    items = sort === 'random' ? shuffle(items) : [...items].sort(SORTS[sort] ?? SORTS.featured);
    const total = items.length;
    const pages = limit ? Math.max(1, Math.ceil(total / limit)) : 1;
    const current = Math.min(page, pages);
    if (limit) items = items.slice((current - 1) * limit, current * limit);

    const price = await productPrice();
    return { items: items.map((product) => toSummary(product, price)), total, page: current, pages };
  },

  async getBySlug(slug) {
    const product = PRODUCTS.find((item) => item.slug === slug);
    if (!product) throw HttpError.notFound('We could not find that piece.');

    const price = await productPrice();
    const related = PRODUCTS.filter((item) => item.collection === product.collection && item.slug !== slug)
      .slice(0, 4)
      .map((item) => toSummary(item, price));

    return { ...toSummary(product, price), description: product.description, images: product.images, related };
  },

  /** Raw catalogue entry, for building order lines. */
  async findBySlug(slug) {
    return PRODUCTS.find((item) => item.slug === slug) ?? null;
  },
};
