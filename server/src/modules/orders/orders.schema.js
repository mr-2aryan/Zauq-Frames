import { z } from 'zod';
import { ORIENTATIONS } from '../frames/frames.catalog.js';

const customerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,20}$/, 'Please enter a valid phone number, e.g. 0323 5992853.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .transform((value) => value || undefined)
    .pipe(z.email('Please enter a valid email address.').optional())
    .optional(),
  address: z.string().trim().min(5, 'Please enter your delivery address.').max(300),
  city: z.string().trim().min(2, 'Please enter your city.').max(80),
  notes: z.string().trim().max(1000).optional(),
});

/** Where the photo sits inside the frame, as CSS object-position percentages. */
const cropSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

const baseItem = {
  sizeId: z.string().trim().min(1),
  orientation: z.enum(ORIENTATIONS),
  quantity: z.number().int().min(1).max(20).default(1),
};

/** A customer's own photo, framed. */
const customFrameItemSchema = z.object({
  type: z.literal('custom-frame'),
  ...baseItem,
  photoId: z.string().trim().min(1, 'Each custom frame needs a photo.'),
  crop: cropSchema.default({ x: 50, y: 50 }),
});

/** A piece from the shop's collections. */
const productItemSchema = z.object({
  type: z.literal('product'),
  ...baseItem,
  productId: z.string().trim().min(1),
});

// Items sent without a `type` are custom frames (the original API shape).
const orderItemSchema = z.preprocess(
  (item) => (item && typeof item === 'object' && !('type' in item) ? { ...item, type: 'custom-frame' } : item),
  z.discriminatedUnion('type', [customFrameItemSchema, productItemSchema]),
);

export const createOrderSchema = z.object({
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1, 'Your order is empty.').max(20),
});
