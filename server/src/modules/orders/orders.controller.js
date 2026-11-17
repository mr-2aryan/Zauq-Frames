import { parseQuery } from '../../middleware/validate.js';
import { trackOrderQuerySchema } from './orders.schema.js';
import { ordersService } from './orders.service.js';

/** POST /api/orders */
export const createOrder = async (req, res) => {
  const order = await ordersService.create(req.body, req.user?.id ?? null);
  res.status(201).json({ data: order });
};

/** GET /api/orders/:orderId — used by "Track your order". */
export const getOrder = async (req, res) => {
  const order = await ordersService.getPublicById(req.params.orderId.toUpperCase());
  res.json({ data: order });
};

/** GET /api/orders/:orderId/track?phone= — status, history and delivery estimate. */
export const trackOrder = async (req, res) => {
  const { phone } = parseQuery(trackOrderQuerySchema, req.query);
  res.json({ data: await ordersService.track(req.params.orderId.trim().toUpperCase(), phone) });
};
