import { createRepository } from '../../lib/createRepository.js';

/** Collections (Islamic Calligraphy, Modern & Minimal, ...), looked up by `slug`. */
export const collectionsRepository = createRepository('collections');

/** Pieces in the shop, looked up by `slug`; `status` is 'active' (in the shop) or 'draft'. */
export const productsRepository = createRepository('products');
