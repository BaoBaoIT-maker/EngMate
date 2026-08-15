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

import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image provided', 400);
    }

    // Upload to Cloudinary using stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'engmate/avatars',
        public_id: `user_${req.user.id}_${Date.now()}`,
        format: 'webp',
        transformation: [{ width: 300, height: 300, crop: 'fill' }]
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return sendError(res, 'Failed to upload image', 500);
        }

        // Update database
        const updatedUser = await userService.updateProfile(req.user.id, { avatarUrl: result.secure_url });
        return sendSuccess(res, updatedUser, 'Avatar uploaded successfully');
      }
    );

    Readable.from(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const updatedUser = await userService.updateProfile(req.user.id, { avatarUrl: null });
    return sendSuccess(res, updatedUser, 'Avatar deleted successfully');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { theme, receiveEmails, dailyWordGoal, onboardingDone } = req.body;

    if (theme !== undefined && !['LIGHT', 'DARK'].includes(theme)) {
      return sendError(res, 'theme must be LIGHT or DARK', 400);
    }
    if (receiveEmails !== undefined && typeof receiveEmails !== 'boolean') {
      return sendError(res, 'receiveEmails must be boolean', 400);
    }

    const result = await userService.updateSetting(req.user.id, {
      theme,
      receiveEmails,
      dailyWordGoal,
      onboardingDone,
    });
    return sendSuccess(res, result, 'Settings updated');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

// ---- Learning Paths ----

/**
 * GET /api/users/me/learning-paths
 * Lấy toàn bộ lộ trình học đang active của user
 */
export const getLearningPaths = async (req, res) => {
  try {
    const result = await userService.getLearningPaths(req.user.id);
    return sendSuccess(res, result, 'Learning paths loaded');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

/**
 * PUT /api/users/me/learning-paths
 * Upsert một hoặc nhiều lộ trình học
 * Body: { paths: [{ category, currentLevel, targetScore }] }
 */
export const saveLearningPaths = async (req, res) => {
  try {
    const { paths } = req.body;

    if (!Array.isArray(paths) || paths.length === 0) {
      return sendError(res, 'paths must be a non-empty array', 400);
    }

    const result = await userService.saveLearningPaths(req.user.id, paths);
    return sendSuccess(res, result, 'Learning paths saved');
  } catch (error) {
    console.error('saveLearningPaths Error:', error);
    return sendError(res, error.message, error.statusCode || 500);
  }
};

/**
 * DELETE /api/users/me/learning-paths/:category
 * Xoá mềm (deactivate) một lộ trình học
 */
export const removeLearningPath = async (req, res) => {
  try {
    const { category } = req.params;
    const result = await userService.removeLearningPath(req.user.id, category.toUpperCase());
    return sendSuccess(res, result, 'Learning path removed');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

/**
 * POST /api/users/me/onboarding
 * Hoàn tất onboarding: lưu paths + dailyWordGoal + đánh dấu onboardingDone = true
 * Body: { paths: [...], dailyWordGoal: 15 }
 */
export const completeOnboarding = async (req, res) => {
  try {
    const { paths, dailyWordGoal } = req.body;

    if (!Array.isArray(paths) || paths.length === 0) {
      return sendError(res, 'paths must be a non-empty array', 400);
    }

    const result = await userService.completeOnboarding(req.user.id, { paths, dailyWordGoal });
    return sendSuccess(res, result, 'Onboarding completed');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};