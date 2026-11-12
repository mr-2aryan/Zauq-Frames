import multer from 'multer';
import { env } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';

const bytesToMb = (bytes) => Math.round(bytes / 1024 / 1024);

/**
 * Maps known library errors to HttpErrors. Returns null for unexpected errors.
 * @param {any} err
 * @returns {HttpError | null}
 */
const normalizeError = (err) => {
  if (err instanceof HttpError) return err;

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new HttpError(413, `That file is too large. The maximum is ${bytesToMb(env.maxUploadBytes)} MB.`);
    }
    return HttpError.badRequest(err.message);
  }

  // Errors raised by express.json()
  if (err?.type === 'entity.parse.failed') return HttpError.badRequest('Request body is not valid JSON.');
  if (err?.type === 'entity.too.large') return new HttpError(413, 'Request body is too large.');

  return null;
};

/**
 * Final error middleware. Every error response has the shape
 * `{ error: { message: string, details?: unknown } }`.
 */
// Express identifies error handlers by their four parameters, so `_next` must stay.
export const errorHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);

  const known = normalizeError(err);
  const status = known?.status ?? 500;

  if (status >= 500) console.error(err);

  const message = known?.message ?? (env.isProduction ? 'Something went wrong. Please try again.' : err.message);

  return res.status(status).json({
    error: {
      message,
      ...(known?.details ? { details: known.details } : {}),
    },
  });
};
