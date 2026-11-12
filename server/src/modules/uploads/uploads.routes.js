import { Router } from 'express';
import { uploadPhoto } from './uploads.controller.js';
import { photoUpload } from './uploads.middleware.js';

const router = Router();

router.post('/', photoUpload, uploadPhoto);

export default router;
