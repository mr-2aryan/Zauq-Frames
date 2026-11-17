import { contactService } from './contact.service.js';

/** POST /api/contact — `{ name, phone, email?, topic, orderId?, message }` */
export const sendMessage = async (req, res) => {
  res.status(201).json({ data: await contactService.send(req.body) });
};
