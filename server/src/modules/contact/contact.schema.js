import { z } from 'zod';

export const CONTACT_TOPICS = Object.freeze(['order', 'custom', 'sizes', 'business', 'other']);

/** POST /api/contact */
export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,20}$/, 'Please enter a valid phone number, e.g. 0323 5992853.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(120)
    .optional()
    .transform((value) => value || undefined)
    .pipe(z.email('Please enter a valid email address.').optional()),
  topic: z.enum(CONTACT_TOPICS, { message: 'Please choose what your message is about.' }),
  orderId: z.string().trim().toUpperCase().max(20).optional(),
  message: z.string().trim().min(10, 'Please tell us a little more (at least 10 characters).').max(2000),
});
