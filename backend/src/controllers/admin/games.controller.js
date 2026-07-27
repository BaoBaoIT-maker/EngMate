import prisma from '../../config/prisma.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// GET /admin/games/config
export const listGameConfigs = async (req, res) => {
  try {
    const configs = await prisma.gameConfig.findMany({ orderBy: { id: 'asc' } });
    return sendSuccess(res, configs, 'Game configs');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// PATCH /admin/games/config/:gameType
export const toggleGame = async (req, res) => {
  try {
    const { gameType } = req.params;
    const config = await prisma.gameConfig.findUnique({ where: { gameType } });
    if (!config) return sendError(res, 'Game config not found', 404);

    const updated = await prisma.gameConfig.update({
      where: { gameType },
      data: { isEnabled: !config.isEnabled },
    });
    return sendSuccess(res, updated, `Game ${gameType} ${updated.isEnabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
