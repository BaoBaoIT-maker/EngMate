import * as chatService from '../services/chat.service.js';
import * as statService from '../services/stat.service.js';
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
    
    // Validate quyền và limit
    await chatService.getSessionMessages(req.user.id, sessionId);

    const limitCheck = await chatService.checkAndUpdateAiLimit(req.user.id);
    if (!limitCheck.allowed) {
      return res.status(403).json({ 
        success: false, 
        message: 'LIMIT_EXCEEDED', 
        current: limitCheck.current, 
        limit: limitCheck.limit 
      });
    }

    // Lưu tin nhắn của user
    await chatService.saveUserMessage(sessionId, content);

    // +5 XP cho mỗi lần luyện nói
    await statService.updateActivityAndExp(req.user.id, 5);

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
