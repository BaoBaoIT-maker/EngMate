import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', userController.me);
router.patch('/me/profile', userController.updateProfile);
router.patch('/me/settings', userController.updateSetting);

export default router;