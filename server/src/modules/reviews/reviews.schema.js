import { z } from 'zod';

const optionalText = (max) =>
  z.preprocess((value) => (typeof value === 'string' && value.trim() === '' ? undefined : value), z.string().trim().max(max).optional());

/** POST /api/products/:slug/reviews */
export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Please choose a rating.').max(5),
  name: z.string().trim().min(2, 'Please enter your name.').max(40, 'Please keep your name under 40 characters.'),
  city: optionalText(40),
  text: z.string().trim().min(10, 'Please write at least a sentence (10 characters).').max(1000, 'Please keep your review under 1,000 characters.'),
  orderId: optionalText(20),
});
