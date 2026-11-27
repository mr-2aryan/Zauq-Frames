import { CURRENCY, DEFAULT_FINISH, DELIVERY_FEE, FRAME_SIZES, PROMOTION } from '../modules/frames/frames.catalog.js';
import { COLLECTIONS, PRODUCTS } from '../modules/products/products.catalog.js';
import { collectionsRepository, productsRepository } from '../modules/products/products.repository.js';
import { seedBlog } from '../modules/blog/blog.service.js';
import { settingsService } from '../modules/settings/settings.service.js';

/** The frame settings the shop started with (sizes, prices, delivery fee, promotion). */
export const DEFAULT_FRAME_SETTINGS = Object.freeze({
  currency: CURRENCY,
  deliveryFee: DELIVERY_FEE,
  finish: DEFAULT_FINISH,
  promotion: { ...PROMOTION },
  sizes: FRAME_SIZES.map((size) => ({ ...size })),
});

/**
 * First run only: fills empty catalogue tables from the original catalogue files.
 * After that the database is the source of truth (edited in the admin), and this
 * does nothing. Returns what it added, for the startup log.
 */
export async function seedCatalogue() {
  const added = [];
  if ((await collectionsRepository.findAll()).length === 0) {
    for (const [index, collection] of COLLECTIONS.entries()) {
      await collectionsRepository.create({ ...collection, sortOrder: index });
    }
    added.push(`${COLLECTIONS.length} collections`);
  }
  if ((await productsRepository.findAll()).length === 0) {
    for (const [index, product] of PRODUCTS.entries()) {
      await productsRepository.create({
        ...product,
        orientation: product.orientation ?? 'portrait',
        art: product.art ?? null,
        cardImage: product.cardImage ?? null,
        badge: product.badge ?? null,
        status: 'active',
        sortOrder: index,
      });
    }
    added.push(`${PRODUCTS.length} products`);
  }
  if ((await settingsService.get('frames')) === null) {
    await settingsService.set('frames', DEFAULT_FRAME_SETTINGS);
    added.push('frame sizes and prices');
  }
  const blog = await seedBlog();
  if (blog) added.push(blog);
  return added;
}
