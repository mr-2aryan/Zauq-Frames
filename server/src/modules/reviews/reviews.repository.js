import { createMemoryRepository } from '../../lib/createMemoryRepository.js';

/** Product reviews. In memory until a database is chosen (see lib/createMemoryRepository.js). */
export const reviewsRepository = createMemoryRepository();
