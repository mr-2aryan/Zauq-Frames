import { newsletterService } from './newsletter.service.js';

/** POST /api/newsletter — `{ email }` */
export const subscribe = async (req, res) => {
  const { email, created } = await newsletterService.subscribe(req.body.email);
  res.status(created ? 201 : 200).json({ data: { email, subscribed: true } });
};
