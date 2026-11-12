import { Router } from 'express';
import { validateBody } from '../../middleware/validate.js';
import { createOrder, getOrder } from './orders.controller.js';
import { createOrderSchema } from './orders.schema.js';

const router = Router();

router.post('/', validateBody(createOrderSchema), createOrder);
router.get('/:orderId', getOrder);

export default router;
