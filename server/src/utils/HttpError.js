/**
 * An error that maps directly to an HTTP response.
 * Throw it anywhere in a route, controller or service — the error handler
 * turns it into `{ error: { message, details } }` with the given status.
 */
export class HttpError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} message Human-readable message, safe to show to users
   * @param {unknown} [details] Optional structured details (e.g. field errors)
   */
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message = 'Bad request.', details) {
    return new HttpError(400, message, details);
  }

  static unauthorized(message = 'Please sign in.') {
    return new HttpError(401, message);
  }

  static notFound(message = 'Not found.') {
    return new HttpError(404, message);
  }

  static conflict(message = 'That already exists.') {
    return new HttpError(409, message);
  }

  static tooManyRequests(message = 'Too many attempts. Please try again later.') {
    return new HttpError(429, message);
  }

  static unsupportedMediaType(message = 'Unsupported file type.') {
    return new HttpError(415, message);
  }
}
