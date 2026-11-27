import { subscribersRepository } from './newsletter.repository.js';

export const newsletterService = {
  /**
   * Idempotent: subscribing twice is not an error.
   * @returns {Promise<{ email: string, created: boolean }>}
   */
  async subscribe(email) {
    const existing = await subscribersRepository.findOneBy('email', email);
    if (existing) {
      if (existing.status === 'unsubscribed') await subscribersRepository.update(existing.id, { status: 'subscribed', resubscribedAt: new Date().toISOString() });
      return { email, created: false };
    }

    await subscribersRepository.create({ email, source: 'footer' });
    return { email, created: true };
  },
};
