import prisma from '../config/prisma.js';

/**
 * Lấy hoặc tạo mới cuộc hội thoại hỗ trợ cho user
 */
export const getOrCreateConversation = async (userId) => {
  let conversation = await prisma.supportConversation.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, profile: { select: { username: true, avatarUrl: true } } } }
    }
  });

  if (!conversation) {
    conversation = await prisma.supportConversation.create({
      data: { userId },
      include: {
        user: { select: { id: true, profile: { select: { username: true, avatarUrl: true } } } }
      }
    });
  }

  return conversation;
};

/**
 * Lấy lịch sử tin nhắn của một cuộc hội thoại
 */
export const getMessages = async (conversationId) => {
  return await prisma.supportMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' }
  });
};

/**
 * Gửi tin nhắn từ User hoặc Admin
 */
export const sendMessage = async ({ conversationId, senderId, senderRole, content }) => {
  const message = await prisma.supportMessage.create({
    data: { conversationId, senderId, senderRole, content }
  });

  // Import động để tránh circular dependency khi module load
  try {
    const { getIO } = await import('../config/socket.js');
    const io = getIO();

    if (senderRole === 'USER') {
      // User gửi → cập nhật unread của Admin, notify Admin room
      await prisma.supportConversation.update({
        where: { id: conversationId },
        data: {
          unreadByAdmin: { increment: 1 },
          lastMessage: content,
          lastMessageAt: new Date()
        }
      });

      io.to('admins').emit('SUPPORT_NEW_MESSAGE', { conversationId, message, senderId });
    } else {
      // Admin gửi → cập nhật unread của User, notify room của user cụ thể
      const conversation = await prisma.supportConversation.findUnique({ where: { id: conversationId } });
      await prisma.supportConversation.update({
        where: { id: conversationId },
        data: {
          unreadByUser: { increment: 1 },
          lastMessage: content,
          lastMessageAt: new Date()
        }
      });

      io.to(`user_${conversation.userId}`).emit('SUPPORT_NEW_MESSAGE', { conversationId, message, senderId });
    }
  } catch (e) {
    console.error('[Support Socket] Emit error:', e.message);
    // Vẫn update DB dù socket lỗi
    const updateData = senderRole === 'USER'
      ? { unreadByAdmin: { increment: 1 }, lastMessage: content, lastMessageAt: new Date() }
      : { unreadByUser: { increment: 1 }, lastMessage: content, lastMessageAt: new Date() };
    await prisma.supportConversation.update({ where: { id: conversationId }, data: updateData });
  }

  return message;
};

/**
 * Đánh dấu đã đọc
 */
export const markRead = async (conversationId, readerRole) => {
  const data = readerRole === 'ADMIN'
    ? { unreadByAdmin: 0 }
    : { unreadByUser: 0 };

  await prisma.supportConversation.update({ where: { id: conversationId }, data });
};

/**
 * [Admin] Lấy danh sách tất cả conversations (sắp xếp theo tin nhắn mới nhất)
 */
export const getAllConversations = async () => {
  // Không dùng nulls: 'last' vì không phải phiên bản Prisma nào cũng hỗ trợ với MySQL
  const conversations = await prisma.supportConversation.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: { select: { username: true, avatarUrl: true } }
        }
      }
    }
  });

  // Sắp xếp thủ công: có tin nhắn mới nhất lên đầu, chưa có tin nhắn xuống cuối
  return conversations.sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
  });
};
