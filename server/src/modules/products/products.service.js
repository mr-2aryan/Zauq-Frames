import { HttpError } from '../../utils/HttpError.js';
import { framesService } from '../frames/frames.service.js';
import { COLLECTIONS, PRODUCTS } from './products.catalog.js';

const SORTS = {
  featured: (a, b) => Number(b.featured) - Number(a.featured),
  'name-asc': (a, b) => a.name.localeCompare(b.name),
  'name-desc': (a, b) => b.name.localeCompare(a.name),
};
export const SORT_OPTIONS = Object.freeze(Object.keys(SORTS));

const collectionBySlug = (slug) => COLLECTIONS.find((collection) => collection.slug === slug);

/** Every collection piece costs the same in any size (PRODUCT_PRICE in frames.catalog.js). */
async function productPrice() {
  const { currency, productPrice: price } = await framesService.getCatalog();
  return { currency, price: price.price, salePrice: price.salePrice };
}

const toSummary = (product, price) => ({
  slug: product.slug,
  name: product.name,
  collection: product.collection,
  collectionName: collectionBySlug(product.collection).name,
  summary: product.summary,
  image: product.images[0],
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
   * @param {{ collections?: string[], q?: string, sort?: string, featured?: boolean, limit?: number }} options
   */
  async list({ collections = [], q = '', sort = 'featured', featured = false, limit } = {}) {
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
    items = [...items].sort(SORTS[sort] ?? SORTS.featured);
    const total = items.length;
    if (limit) items = items.slice(0, limit);

    const price = await productPrice();
    return { items: items.map((product) => toSummary(product, price)), total };
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
