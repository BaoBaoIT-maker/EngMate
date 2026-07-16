import * as userService from '../services/user.service.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const me = async (req, res) => {
  try {
    const result = await userService.getMe(req.user.id);
    return sendSuccess(res, result, 'Profile loaded');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, avatarUrl, bio } = req.body;

    if (username !== undefined && typeof username !== 'string') {
      return sendError(res, 'username must be a string', 400);
    }

    if (username !== undefined && (username.length < 3 || username.length > 50)) {
      return sendError(res, 'username must be between 3 and 50 characters', 400);
    }

    if (avatarUrl !== undefined && avatarUrl !== null && typeof avatarUrl !== 'string') {
      return sendError(res, 'avatarUrl must be a string or null', 400);
    }

    if (bio !== undefined && bio !== null && typeof bio !== 'string') {
      return sendError(res, 'bio must be a string or null', 400);
    }

    const result = await userService.updateProfile(req.user.id, { username, avatarUrl, bio });
    return sendSuccess(res, result, 'Profile updated');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { theme, receiveEmails } = req.body;

    if (theme !== undefined && !['LIGHT', 'DARK'].includes(theme)) {
      return sendError(res, 'theme must be LIGHT or DARK', 400);
    }

    if (receiveEmails !== undefined && typeof receiveEmails !== 'boolean') {
      return sendError(res, 'receiveEmails must be boolean', 400);
    }

    const result = await userService.updateSetting(req.user.id, { theme, receiveEmails });
    return sendSuccess(res, result, 'Settings updated');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};