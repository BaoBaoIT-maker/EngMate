import prisma from '../config/prisma.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const defaultModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const createSession = async (userId, data) => {
  const { topic, targetLevel = 'B1', category = 'GENERAL' } = data;
  
  const session = await prisma.chatSession.create({
    data: {
      userId,
      topic,
      targetLevel,
      category,
    }
  });

  // Tạo tin nhắn chào mừng mặc định
  let welcomeText = `Hello! I'm your AI Speaking Coach. Today we will talk about **"${topic}"**. `;
  if (topic.includes("IELTS")) {
    welcomeText += `Let's practice for your IELTS speaking test. Are you ready? Just say 'Yes' to begin, and I will ask you the first question.`;
  } else {
    welcomeText += `Are you ready? Please say 'Hello' or 'Yes' to start, and I'll ask you the first question!`;
  }

  const welcomeMsg = await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      senderRole: 'MODEL',
      content: welcomeText,
    }
  });

  return { session, welcomeMsg };
};

export const getSessions = async (userId) => {
  return await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getSessionMessages = async (userId, sessionId) => {
  // Xác thực quyền sở hữu
  const session = await prisma.chatSession.findFirst({
    where: { id: parseInt(sessionId), userId }
  });
  if (!session) throw new Error('Session not found or unauthorized');

  return await prisma.chatMessage.findMany({
    where: { sessionId: parseInt(sessionId) },
    orderBy: { createdAt: 'asc' }
  });
};

export const saveUserMessage = async (sessionId, content) => {
  return await prisma.chatMessage.create({
    data: {
      sessionId: parseInt(sessionId),
      senderRole: 'USER',
      content,
    }
  });
};

export const streamAIResponse = async (sessionId, res) => {
  try {
    const session = await prisma.chatSession.findUnique({ where: { id: parseInt(sessionId) } });
    if (!session) throw new Error('Session not found');

    const history = await prisma.chatMessage.findMany({
      where: { sessionId: parseInt(sessionId) },
      orderBy: { createdAt: 'asc' }
    });

    const model = genAI.getGenerativeModel({ model: defaultModel });

    const contents = history.map(msg => ({
      role: msg.senderRole === 'USER' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Bổ sung system instructions qua tin nhắn mồi (vì không phải model nào cũng support system_instruction direct)
    const promptSystem = `Bạn là một AI Speaking Coach (Giáo viên bản xứ) hỗ trợ người dùng luyện nói tiếng Anh. 
Chủ đề hiện tại là: "${session.topic}". 
Mục tiêu trình độ của người dùng: ${session.targetLevel}.
Quy tắc BẮT BUỘC:
1. Đóng vai trò là người trò chuyện hoặc giám khảo. Trả lời ngắn gọn, tự nhiên.
2. MỖI LẦN TRẢ LỜI, BẠN PHẢI KẾT THÚC BẰNG MỘT CÂU HỎI MỞ (liên quan đến chủ đề) để gợi ý người dùng nói tiếp. KHÔNG BAO GIỜ chỉ trả lời mà không đặt câu hỏi.
3. Nếu người dùng mắc lỗi ngữ pháp hoặc dùng từ chưa hay, bạn CÓ THỂ chèn một đoạn feedback nhỏ ở cuối tin nhắn, bắt đầu bằng "💡 Tip:" và giải thích bằng TIẾNG VIỆT.
4. Trừ phần "💡 Tip:", toàn bộ phần giao tiếp còn lại phải bằng TIẾNG ANH.`;

    contents.unshift({
      role: 'user',
      parts: [{ text: promptSystem }]
    });
    contents.unshift({
      role: 'model',
      parts: [{ text: "Đã hiểu, tôi sẽ đóng vai trò AI Speaking Coach theo yêu cầu của bạn." }]
    });

    const resultStream = await model.generateContentStream({ contents });
    
    let fullResponse = '';

    for await (const chunk of resultStream.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      // Gửi event qua SSE
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // Sau khi stream xong, lưu vào DB
    await prisma.chatMessage.create({
      data: {
        sessionId: parseInt(sessionId),
        senderRole: 'MODEL',
        content: fullResponse
      }
    });

    res.write('event: done\ndata: {}\n\n');
    res.end();
  } catch (error) {
    console.error('Lỗi khi stream AI:', error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
    res.end();
  }
};
