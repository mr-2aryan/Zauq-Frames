import { env } from '../../config/env.js';
import { usersRepository } from '../auth/users.repository.js';
import { sendMail } from './mailer.js';
import { orderEmail } from './orderEmail.js';

/** Where an order's emails go: the email given at checkout, else the account's. */
async function recipientFor(order) {
  if (order.customer?.email) return order.customer.email;
  if (order.customerId) return (await usersRepository.findById(order.customerId))?.email ?? null;
  return null;
}

export const emailService = {
  /**
   * Emails the customer about their order at its current status (placed,
   * confirmed, in production, shipped, delivered or cancelled). Never throws:
   * a failed email must not fail the order — it is logged instead.
   * @param {Record<string, any>} order the stored order
   */
  async sendOrderUpdate(order) {
    try {
      const to = await recipientFor(order);
      if (!to) return { sent: false, reason: 'no email address' };
      const { subject, html, text } = orderEmail(order, { publicUrl: env.publicUrl });
      return await sendMail({ to, subject, html, text, tag: `${order.id}-${order.status}` });
    } catch (error) {
      console.error(`Could not send the email for order ${order.id}:`, error.message);
      return { sent: false, reason: 'error' };
    }
  },
};
