import { Router } from 'express';
import { validateBody } from '../../middleware/validate.js';
import { createOrder, getOrder, trackOrder } from './orders.controller.js';
import { createOrderSchema } from './orders.schema.js';

const router = Router();

router.post('/', validateBody(createOrderSchema), createOrder);
router.get('/:orderId/track', trackOrder);
router.get('/:orderId', getOrder);

export default router;
