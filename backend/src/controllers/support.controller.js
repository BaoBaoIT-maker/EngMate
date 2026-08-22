import * as supportService from '../services/support.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * [User] Lấy hoặc tạo conversation của chính mình
 */
export const getMyConversation = async (req, res) => {
  try {
    const conversation = await supportService.getOrCreateConversation(req.user.id);
    
    // Mark as read by user when they open the chat
    if (conversation && conversation.id) {
      await supportService.markRead(conversation.id, 'USER');
    }

    return sendSuccess(res, conversation);
  } catch (error) {
    console.error('[Support] getMyConversation error:', error.message, error.stack);
    return sendError(res, error.message, 500);
  }
};

/**
 * [User / Admin] Lấy lịch sử tin nhắn của conversation
 */
export const getMessages = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) return sendError(res, 'ID không hợp lệ', 400);

    const messages = await supportService.getMessages(conversationId);

    // Đánh dấu đã đọc
    const readerRole = req.user.role === 'ADMIN' ? 'ADMIN' : 'USER';
    await supportService.markRead(conversationId, readerRole);

    return sendSuccess(res, messages);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * [User / Admin] Gửi tin nhắn
 */
export const sendMessage = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content?.trim()) return sendError(res, 'Nội dung tin nhắn không được để trống', 400);
    if (isNaN(conversationId)) return sendError(res, 'ID không hợp lệ', 400);

    const senderRole = req.user.role === 'ADMIN' ? 'ADMIN' : 'USER';

    const message = await supportService.sendMessage({
      conversationId,
      senderId: req.user.id,
      senderRole,
      content: content.trim()
    });

    return sendSuccess(res, message, 'Gửi tin nhắn thành công', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * [Admin] Lấy toàn bộ danh sách conversations
 */
export const getAllConversations = async (req, res) => {
  try {
    const conversations = await supportService.getAllConversations();
    return sendSuccess(res, conversations);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
