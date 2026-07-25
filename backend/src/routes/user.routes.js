import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

// Profile & Settings
router.get('/me', userController.me);
router.patch('/me/profile', userController.updateProfile);
router.patch('/me/settings', userController.updateSetting);

// Learning Paths
router.get('/me/learning-paths', userController.getLearningPaths);
router.put('/me/learning-paths', userController.saveLearningPaths);
router.delete('/me/learning-paths/:category', userController.removeLearningPath);

// Onboarding
router.post('/me/onboarding', userController.completeOnboarding);

export default router;