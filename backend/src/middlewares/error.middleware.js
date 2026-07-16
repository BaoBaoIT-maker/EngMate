import { sendError } from '../utils/response.js';

export const notFound = (req, res, next) => {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    // Keep stack traces out of the response in production, but expose them locally.
    return sendError(res, message, statusCode, err.stack || null);
  }

  return sendError(res, message, statusCode);
};