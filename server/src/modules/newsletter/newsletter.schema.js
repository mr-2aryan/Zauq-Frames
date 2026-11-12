import { z } from 'zod';

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Please enter a valid email address.')),
});
