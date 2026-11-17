import { messagesRepository } from './contact.repository.js';

export const contactService = {
  /**
   * Saves a message for the team; replies go out by WhatsApp, phone or email.
   * @returns {Promise<{ id: string, createdAt: string }>}
   */
  async send(message) {
    const saved = await messagesRepository.create({ ...message, status: 'new' });
    return { id: saved.id, createdAt: saved.createdAt };
  },
};
