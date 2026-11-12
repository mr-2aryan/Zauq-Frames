import { Router } from 'express';
import { getCatalog } from './frames.controller.js';

const router = Router();

router.get('/catalog', getCatalog);

export default router;
