import * as chatService from '../services/chat.service.js';
import { sendSuccess } from '../utils/response.js';

export const createSession = async (req, res, next) => {
  try {
    const result = await chatService.createSession(req.user.id, req.body);
    return sendSuccess(res, result, "Session created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await chatService.getSessions(req.user.id);
    return sendSuccess(res, sessions);
  } catch (error) {
    next(error);
  }
};

export const getSessionMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getSessionMessages(req.user.id, req.params.id);
    return sendSuccess(res, messages);
  } catch (error) {
    next(error);
  }
};

export const streamMessage = async (req, res, next) => {
  try {
    const { sessionId, content } = req.body;
    
    // Validate quyền (có thể đưa logic này vào middleware hoặc service)
    await chatService.getSessionMessages(req.user.id, sessionId); // Hàm này tự văng lỗi nếu user ko có quyền

    // Lưu tin nhắn của user
    await chatService.saveUserMessage(sessionId, content);

    // Setup headers cho SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Bắt đầu stream AI response
    await chatService.streamAIResponse(sessionId, res);
  } catch (error) {
    // Nếu lỗi xảy ra trước khi stream, văng lỗi ra errorHandler như bình thường
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    }
  }
};
