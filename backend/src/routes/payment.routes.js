import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = express.Router();

// Lấy danh sách các gói dịch vụ
router.get('/plans', paymentController.getPlans);

// Tạo mã thanh toán QR
router.post('/create-qr', authenticate, paymentController.createPayment);

// Webhook nhận thông báo từ SePay (Không cần auth vì SePay gọi bằng ApiKey)
router.post('/sepay-webhook', paymentController.handleSePayWebhook);

export default router;
