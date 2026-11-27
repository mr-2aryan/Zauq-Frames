import { HttpError } from '../../utils/HttpError.js';
import { framesService } from '../frames/frames.service.js';
import { collectionsRepository, productsRepository } from './products.repository.js';
import { collectionSeo, productSeo } from '../seo/titles.js';

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

/**
 * The catalogue, from the database: collections, and the products that are in the
 * shop (status 'active'), both in their admin order. Kept in memory between changes;
 * the admin calls `productsService.invalidate()` after saving.
 */
let cached = null;
const byOrder = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);

async function catalogue() {
  if (!cached) {
    const [collections, products] = await Promise.all([collectionsRepository.findAll(), productsRepository.findAll()]);
    cached = {
      collections: collections.sort(byOrder),
      products: products.filter((product) => product.status === 'active').sort(byOrder),
    };
  }
  return cached;
}

/** What the shop shows of a collection. */
const toPublicCollection = ({ slug, name, shortName, description, image }) => ({ slug, name, shortName, description, image });

/** Pieces are priced by frame size; summaries carry the smallest size's price ("from"). */
async function productPrice() {
  const { currency, sizes } = await framesService.getCatalog();
  const cheapest = sizes.reduce((min, size) => (size.salePrice < min.salePrice ? size : min));
  return { currency, price: cheapest.price, salePrice: cheapest.salePrice };
}

const toSummary = (product, price, collectionBySlug) => ({
  slug: product.slug,
  name: product.name,
  collection: product.collection,
  collectionName: collectionBySlug(product.collection)?.name ?? '',
  summary: product.summary,
  orientation: product.orientation ?? 'portrait',
  image: product.cardImage ?? product.images[0],
  // A small picture of the artwork on its own, for thumbnails (null if there's none).
  art: product.art ?? null,
  featured: product.featured,
  badge: product.badge,
  ...price,
});

const matchesSearch = (product, terms, collectionBySlug) => {
  const haystack = `${product.name} ${collectionBySlug(product.collection)?.name ?? ''} ${product.summary}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
};

async function lookups() {
  const { collections, products } = await catalogue();
  const bySlug = new Map(collections.map((collection) => [collection.slug, collection]));
  return { collections, products, collectionBySlug: (slug) => bySlug.get(slug) };
}

export const productsService = {
  async listCollections() {
    const { collections, products } = await catalogue();
    const catalog = await framesService.getCatalog();
    return collections.map((collection) => {
      const { title: seoTitle, description: seoDescription } = collectionSeo(collection, catalog);
      return { ...toPublicCollection(collection), productCount: products.filter((product) => product.collection === collection.slug).length, seoTitle, seoDescription };
    });
  },

  async getCollection(slug) {
    const { collectionBySlug } = await lookups();
    const collection = collectionBySlug(slug);
    if (!collection) throw HttpError.notFound('We could not find that collection.');
    const { title: seoTitle, description: seoDescription } = collectionSeo(collection, await framesService.getCatalog());
    return { ...toPublicCollection(collection), seoTitle, seoDescription };
  },

  /**
   * `limit` is the page size; `page` (from 1) picks which page of results to return.
   * @param {{ collections?: string[], q?: string, sort?: string, featured?: boolean, limit?: number, page?: number }} options
   */
  async list({ collections = [], q = '', sort = 'featured', featured = false, limit, page = 1 } = {}) {
    const { products, collectionBySlug } = await lookups();
    const unknown = collections.find((slug) => !collectionBySlug(slug));
    if (unknown) throw HttpError.notFound(`We could not find the collection "${unknown}".`);

    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    let items = products.filter(
      (product) =>
        (!collections.length || collections.includes(product.collection)) &&
        (!featured || product.featured) &&
        (!terms.length || matchesSearch(product, terms, collectionBySlug)),
    );
    // Array.prototype.sort is stable, so equal items keep catalogue order.
    items = sort === 'random' ? shuffle(items) : [...items].sort(SORTS[sort] ?? SORTS.featured);
    const total = items.length;
    const pages = limit ? Math.max(1, Math.ceil(total / limit)) : 1;
    const current = Math.min(page, pages);
    if (limit) items = items.slice((current - 1) * limit, current * limit);

    const price = await productPrice();
    return { items: items.map((product) => toSummary(product, price, collectionBySlug)), total, page: current, pages };
  },

  async getBySlug(slug) {
    const { products, collectionBySlug } = await lookups();
    // An old link (the slug was changed in the admin) still finds the piece; the shop then moves to the new address.
    const product = products.find((item) => item.slug === slug) ?? products.find((item) => (item.previousSlugs ?? []).includes(slug));
    if (!product) throw HttpError.notFound('We could not find that piece.');

    const price = await productPrice();
    const related = products
      .filter((item) => item.collection === product.collection && item.slug !== slug)
      .slice(0, 4)
      .map((item) => toSummary(item, price, collectionBySlug));

    const { title: seoTitle, description: seoDescription } = productSeo(product, await framesService.getCatalog());
    return { ...toSummary(product, price, collectionBySlug), description: product.description, images: product.images, seoTitle, seoDescription, related };
  },

  /** A product in the shop (active), as stored: for building order lines. */
  async findBySlug(slug) {
    const { products } = await catalogue();
    return products.find((item) => item.slug === slug) ?? null;
  },

  /** Call after the admin changes collections or products. */
  invalidate() {
    cached = null;
  },
};
