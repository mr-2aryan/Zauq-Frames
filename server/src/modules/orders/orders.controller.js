import { ordersService } from './orders.service.js';

/** POST /api/orders */
export const createOrder = async (req, res) => {
  const order = await ordersService.create(req.body);
  res.status(201).json({ data: order });
};

/** GET /api/orders/:orderId — used by "Track your order". */
export const getOrder = async (req, res) => {
  const order = await ordersService.getPublicById(req.params.orderId.toUpperCase());
  res.json({ data: order });
};
