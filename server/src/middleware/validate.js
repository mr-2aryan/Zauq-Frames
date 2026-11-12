import { HttpError } from '../utils/HttpError.js';

/**
 * Converts Zod issues into a flat, client-friendly list.
 * @param {import('zod').ZodError} error
 */
const toFieldErrors = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || null,
    message: issue.message,
  }));

/**
 * Validates `req.body` against a Zod schema. On success the body is replaced
 * with the parsed (trimmed, defaulted) data; on failure a 400 is returned.
 *
 * @param {import('zod').ZodType} schema
 */
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    return next(HttpError.badRequest('Please check the highlighted fields.', toFieldErrors(result.error)));
  }
  req.body = result.data;
  return next();
};

/**
 * Parses a query string with a Zod schema and returns the result, or throws a 400.
 * (Express 5 makes `req.query` read-only, so it is parsed where it is used.)
 *
 * @param {import('zod').ZodType} schema
 * @param {unknown} query
 */
export function parseQuery(schema, query) {
  const result = schema.safeParse(query ?? {});
  if (!result.success) throw HttpError.badRequest('Invalid search options.', toFieldErrors(result.error));
  return result.data;
}
