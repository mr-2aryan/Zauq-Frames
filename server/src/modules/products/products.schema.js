import { z } from 'zod';
import { SORT_OPTIONS } from './products.service.js';

/** GET /api/products query string. `collection` may list several slugs: `a,b`. */
export const listProductsQuerySchema = z.object({
  collection: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.split(',').map((slug) => slug.trim()).filter(Boolean) : [])),
  q: z.string().trim().max(80).optional().default(''),
  sort: z.enum(SORT_OPTIONS).optional().default('featured'),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
  limit: z.coerce.number().int().min(1).max(48).optional(),
});
