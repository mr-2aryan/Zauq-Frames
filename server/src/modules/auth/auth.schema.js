import { z } from 'zod';

const email = z.string().trim().toLowerCase().max(160).pipe(z.email('Please enter a valid email address.'));
const newPassword = z.string().min(8, 'Use a password of at least 8 characters.').max(200);
const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s-]{10,20}$/, 'Please enter a valid phone number, e.g. 0323 5992853.');
const optional = (schema) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .pipe(schema.optional());

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(120),
  email,
  password: newPassword,
  phone: optional(phone),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Please enter your password.').max(200),
});

/** Saved for faster checkout. */
export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(120),
  phone: optional(phone),
  address: z.string().trim().max(300).optional().default(''),
  city: z.string().trim().max(80).optional().default(''),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Please enter your current password.').max(200),
  newPassword,
});
