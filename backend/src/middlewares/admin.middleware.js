import { sendError } from '../utils/response.js';

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return sendError(res, 'Forbidden: Admin access required', 403);
  }
  return next();
};
