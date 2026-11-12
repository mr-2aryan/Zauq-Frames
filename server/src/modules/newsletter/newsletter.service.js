import { subscribersRepository } from './newsletter.repository.js';

export const newsletterService = {
  /**
   * Idempotent: subscribing twice is not an error.
   * @returns {Promise<{ email: string, created: boolean }>}
   */
  async subscribe(email) {
    const existing = await subscribersRepository.findOne((subscriber) => subscriber.email === email);
    if (existing) return { email, created: false };

    await subscribersRepository.create({ email, source: 'footer' });
    return { email, created: true };
  },
};
