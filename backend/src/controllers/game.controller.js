import * as gameService from '../services/game.service.js';
import { sendSuccess } from '../utils/response.js';
import prisma from '../config/prisma.js';

export const getGameConfigs = async (req, res, next) => {
  try {
    const configs = await prisma.gameConfig.findMany();
    return sendSuccess(res, configs);
  } catch (error) {
    next(error);
  }
};

export const getMatchingData = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await gameService.getMatchingData(req.user.id, limit);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getFillBlankData = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await gameService.getFillBlankData(req.user.id, limit);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const submitGameResult = async (req, res, next) => {
  try {
    const { results, gameType } = req.body;
    if (!Array.isArray(results)) {
      throw new Error('Results must be an array');
    }
    const result = await gameService.submitGameResult(req.user.id, results, gameType || 'MATCHING');
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
