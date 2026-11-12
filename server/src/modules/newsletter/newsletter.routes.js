import { Router } from 'express';
import { validateBody } from '../../middleware/validate.js';
import { subscribe } from './newsletter.controller.js';
import { subscribeSchema } from './newsletter.schema.js';

const router = Router();

router.post('/', validateBody(subscribeSchema), subscribe);

export default router;
