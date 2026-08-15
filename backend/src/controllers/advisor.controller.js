import { runAdvisorAgent } from '../services/rag/orchestrator.js';
import { sendError } from '../utils/response.js';

/**
 * POST /api/advisor/chat
 * Body: { message: string }
 * Response: SSE stream (text/event-stream)
 */
export const advisorChat = async (req, res) => {
  const { message, history } = req.body;
  const userId = req.user.id;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return sendError(res, 'Câu hỏi không được để trống.', 400);
  }

  if (message.trim().length > 500) {
    return sendError(res, 'Câu hỏi không được vượt quá 500 ký tự.', 400);
  }

  // ─── Thiết lập SSE headers ──────────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Truyền thông tin rate limit cho FE qua header
  if (req.rateLimit) {
    res.setHeader('X-RateLimit-Daily-Used', req.rateLimit.daily.used);
    res.setHeader('X-RateLimit-Daily-Limit', req.rateLimit.daily.limit);
  }

  // Xử lý khi client ngắt kết nối giữa chừng
  req.on('close', () => {
    res.end();
  });

  try {
    await runAdvisorAgent(message.trim(), userId, res, history || []);
  } catch (error) {
    console.error('[AdvisorController] Error:', error);
    // Nếu headers chưa được gửi, trả lỗi JSON bình thường
    if (!res.headersSent) {
      return sendError(res, 'Hệ thống AI đang gặp sự cố, vui lòng thử lại sau.', 500);
    }
    // Nếu đang stream, gửi event lỗi cuối cùng
    res.write(`data: ${JSON.stringify({ error: 'Đã xảy ra lỗi trong quá trình xử lý.' })}\n\n`);
    res.end();
  }
};

/**
 * GET /api/advisor/limit
 * Kiểm tra số câu hỏi còn lại trong ngày (không tốn quota)
 */
export const getAdvisorLimit = async (req, res) => {
  const { sendSuccess } = await import('../utils/response.js');
  // req.rateLimit được gắn bởi middleware
  return sendSuccess(res, {
    used: req.rateLimit?.daily?.used || 0,
    limit: req.rateLimit?.daily?.limit || 5,
    isPremium: req.rateLimit?.isPremium || false
  }, 'Lấy thông tin giới hạn thành công.');
};
