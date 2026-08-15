import { Router } from 'express';
import { advisorChat, getAdvisorLimit } from '../controllers/advisor.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import advisorRateLimit from '../middlewares/advisorRateLimit.middleware.js';

const router = Router();

// Tất cả routes đều cần đăng nhập
router.use(authenticate);

// POST /api/advisor/chat — Gửi câu hỏi, nhận SSE stream
router.post('/chat', advisorRateLimit, advisorChat);

// GET /api/advisor/limit — Kiểm tra giới hạn còn lại (dùng middleware để đọc Redis, nhưng không tốn quota)
router.get('/limit', advisorRateLimit, getAdvisorLimit);

export default router;
