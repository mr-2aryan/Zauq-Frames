import { HttpError } from '../utils/HttpError.js';

/** Catches any request that no route handled. */
export const notFound = (req, _res, next) => {
  next(HttpError.notFound(`Route ${req.method} ${req.originalUrl} not found.`));
};
