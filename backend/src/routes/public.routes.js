import express from 'express';
import { getAdminProfile } from '../controllers/user.controller.js';

const router = express.Router();

// Lấy thông tin admin đầu tiên trong hệ thống (để hiển thị public như ở trang About)
router.get('/admin-profile', getAdminProfile);

export default router;
