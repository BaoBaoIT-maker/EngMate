import * as statService from '../services/stat.service.js';
import { sendSuccess } from '../utils/response.js';

export const getOverviewStats = async (req, res, next) => {
  try {
    const stats = await statService.getOverviewStats(req.user.id);
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};
