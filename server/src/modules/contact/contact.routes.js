import { Router } from 'express';
import { validateBody } from '../../middleware/validate.js';
import { sendMessage } from './contact.controller.js';
import { contactMessageSchema } from './contact.schema.js';

const router = Router();

router.post('/', validateBody(contactMessageSchema), sendMessage);

export default router;
