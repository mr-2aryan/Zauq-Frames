import { createMemoryRepository } from '../../lib/createMemoryRepository.js';

// In-memory for now — replace with a DB-backed repository exposing the same methods.
export const subscribersRepository = createMemoryRepository();
