import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { HttpError } from '../../utils/HttpError.js';

/** Upload size limits by form field, also used for the "too large" message. */
export const UPLOAD_LIMITS = { images: 25 * 1024 * 1024, artwork: 600 * 1024 * 1024 };

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ARTWORK_TYPES = new Set([...IMAGE_TYPES, 'image/tiff']);

/** Shop images (product photos, banners): up to 20 at a time, 25 MB each, checked again by content. */
export const imageUploads = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_LIMITS.images, files: 20 },
  fileFilter: (_req, file, cb) =>
    IMAGE_TYPES.has(file.mimetype) ? cb(null, true) : cb(HttpError.unsupportedMediaType('Only JPG, PNG or WebP images are allowed.')),
}).array('images', 20);

/** One print-quality artwork file (can be very large: written to a temporary file, not memory). */
const tempDir = path.join(os.tmpdir(), 'zauq-artwork');
fs.mkdirSync(tempDir, { recursive: true });
export const artworkUpload = multer({
  storage: multer.diskStorage({ destination: tempDir, filename: (_req, _file, cb) => cb(null, randomUUID()) }),
  limits: { fileSize: UPLOAD_LIMITS.artwork, files: 1 },
  fileFilter: (_req, file, cb) =>
    ARTWORK_TYPES.has(file.mimetype) ? cb(null, true) : cb(HttpError.unsupportedMediaType('Only JPG, PNG, WebP or TIFF files are allowed.')),
}).single('artwork');
