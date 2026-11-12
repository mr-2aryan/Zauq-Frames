import { randomBytes } from 'node:crypto';
import { createMemoryRepository } from '../../lib/createMemoryRepository.js';

/** Human-friendly order numbers, e.g. `ZQ-4F9A1C7B2E`. */
const generateOrderNumber = () => `ZQ-${randomBytes(5).toString('hex').toUpperCase()}`;

// In-memory for now — replace with a DB-backed repository exposing the same methods.
export const ordersRepository = createMemoryRepository({ generateId: generateOrderNumber });
