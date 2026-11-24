import { randomBytes } from 'node:crypto';
import { createRepository } from '../../lib/createRepository.js';

/** Human-friendly order numbers, e.g. `ZQ-4F9A1C7B2E`. */
const generateOrderNumber = () => `ZQ-${randomBytes(5).toString('hex').toUpperCase()}`;

export const ordersRepository = createRepository('orders', { generateId: generateOrderNumber });
