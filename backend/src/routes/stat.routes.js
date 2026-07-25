import express from 'express';
import * as statController from '../controllers/stat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Tất cả các route thống kê đều cần đăng nhập
router.use(authenticate);

router.get('/overview', statController.getOverviewStats);

export default router;
