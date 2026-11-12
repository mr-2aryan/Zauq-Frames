import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/HttpError.js';

/** Accepted image types and the extension each is stored with. */
export const ALLOWED_IMAGE_TYPES = Object.freeze({
  'image/jpeg': '.jpg',
  'image/png': '.png',
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  // Never trust the client's filename — store under a random id.
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${ALLOWED_IMAGE_TYPES[file.mimetype]}`),
});

/** Parses a single multipart file from the `photo` field. */
export const photoUpload = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES[file.mimetype]) return cb(null, true);
    return cb(HttpError.unsupportedMediaType('Only JPG or PNG images are allowed.'));
  },
}).single('photo');
