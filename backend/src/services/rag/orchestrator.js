import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Import tất cả tools
import { searchKnowledgeBaseTool } from './tools/searchKnowledgeTool.js';
import { getUserProfileTool, getUserSubscriptionTool } from './tools/userAccountTools.js';
import {
  getStudyOverviewTool,
  getFlashcardStatsTool,
  getSpeakingSessionsTool,
  getGameStatsTool,
  getStudyRecommendationTool
} from './tools/studyProgressTools.js';
import { getPaymentHistoryTool } from './tools/paymentTool.js';

// ─── Khai báo Tool Definitions cho Gemini ──────────────────────────────────
// Gemini sử dụng format Function Declaration để hiểu khi nào gọi tool nào
const TOOL_DEFINITIONS = [
  {
    name: searchKnowledgeBaseTool.name,
    description: searchKnowledgeBaseTool.description,
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Câu truy vấn tìm kiếm bằng tiếng Việt hoặc tiếng Anh' }
      },
      required: ['query']
    }
  },
  {
    name: getUserProfileTool.name,
    description: getUserProfileTool.description,
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: getUserSubscriptionTool.name,
    description: getUserSubscriptionTool.description,
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: getStudyOverviewTool.name,
    description: getStudyOverviewTool.description,
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: getFlashcardStatsTool.name,
    description: getFlashcardStatsTool.description,
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: getSpeakingSessionsTool.name,
    description: getSpeakingSessionsTool.description,
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: getGameStatsTool.name,
    description: getGameStatsTool.description,
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: getStudyRecommendationTool.name,
    description: getStudyRecommendationTool.description,
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: getPaymentHistoryTool.name,
    description: getPaymentHistoryTool.description,
    parameters: { type: 'OBJECT', properties: {} }
  }
];

// ─── Map tên tool → hàm thực thi ───────────────────────────────────────────
const TOOL_EXECUTOR_MAP = {
  [searchKnowledgeBaseTool.name]: (args, userId) => searchKnowledgeBaseTool.execute(args.query),
  [getUserProfileTool.name]: (args, userId) => getUserProfileTool.execute(userId),
  [getUserSubscriptionTool.name]: (args, userId) => getUserSubscriptionTool.execute(userId),
  [getStudyOverviewTool.name]: (args, userId) => getStudyOverviewTool.execute(userId),
  [getFlashcardStatsTool.name]: (args, userId) => getFlashcardStatsTool.execute(userId),
  [getSpeakingSessionsTool.name]: (args, userId) => getSpeakingSessionsTool.execute(userId),
  [getGameStatsTool.name]: (args, userId) => getGameStatsTool.execute(userId),
  [getStudyRecommendationTool.name]: (args, userId) => getStudyRecommendationTool.execute(userId),
  [getPaymentHistoryTool.name]: (args, userId) => getPaymentHistoryTool.execute(userId)
};

// ─── System Prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Bạn là AI Tư vấn khách hàng của EngMate — nền tảng học tiếng Anh thông minh.
Nhiệm vụ của bạn là hỗ trợ người dùng giải đáp thắc mắc về tính năng, gói cước, tiến độ học tập và tài khoản.

NGUYÊN TẮC BẮT BUỘC:
- Luôn trả lời bằng tiếng Việt, thân thiện và ngắn gọn.
- Chỉ sử dụng thông tin từ kết quả các tool. Không tự bịa thông tin.
- Nếu câu hỏi không liên quan đến EngMate, từ chối lịch sự và hướng user về đúng chủ đề.
- Khi có dữ liệu tool, hãy tổng hợp thành câu trả lời rõ ràng, có thể dùng emoji và bullet points cho dễ đọc.
- Nếu không có đủ thông tin để trả lời, hãy thừa nhận và hướng dẫn user liên hệ CSKH qua Live Chat.`;

/**
 * Orchestrator chính: Nhận câu hỏi của user, chạy vòng lặp agentic với Gemini + Tool Calling
 * và stream kết quả về cho client.
 *
 * @param {string} userMessage - Câu hỏi của người dùng
 * @param {number} userId - ID của user đang đăng nhập
 * @param {import('express').Response} res - Express response object để stream
 */
export async function runAdvisorAgent(userMessage, userId, res) {
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genai.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: TOOL_DEFINITIONS }]
  });

  // Lịch sử hội thoại (single-turn trong trường hợp này)
  const history = [];
  let currentMessage = userMessage;

  // Giới hạn vòng lặp để tránh vòng lặp vô tận
  const MAX_ITERATIONS = 5;
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    // Gửi request tới Gemini
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(currentMessage);
    const response = result.response;
    const candidate = response.candidates?.[0];

    if (!candidate) {
      res.write(`data: ${JSON.stringify({ error: 'Không có phản hồi từ AI.' })}\n\n`);
      break;
    }

    const parts = candidate.content?.parts || [];
    const toolCallParts = parts.filter(p => p.functionCall);
    const textParts = parts.filter(p => p.text);

    // ─── Nếu Gemini muốn gọi tools ─────────────────────────────────────────
    if (toolCallParts.length > 0) {
      // Thêm turn của model (chứa tool calls) vào history
      history.push({ role: 'model', parts });

      // Thực thi TẤT CẢ tools được yêu cầu song song (Promise.all)
      const toolResults = await Promise.all(
        toolCallParts.map(async (part) => {
          const { name, args } = part.functionCall;
          const executor = TOOL_EXECUTOR_MAP[name];

          let toolResult;
          if (executor) {
            try {
              toolResult = await executor(args, userId);
            } catch (err) {
              console.error(`[Advisor] Tool ${name} error:`, err);
              toolResult = `Lỗi khi lấy dữ liệu từ tool ${name}: ${err.message}`;
            }
          } else {
            toolResult = `Tool "${name}" không tồn tại.`;
          }

          return {
            functionResponse: {
              name,
              response: { result: toolResult }
            }
          };
        })
      );

      // Thêm kết quả tools vào history và lặp lại vòng tiếp theo
      history.push({ role: 'user', parts: toolResults });
      currentMessage = ''; // Gemini sẽ tiếp tục từ context history

      // Sau khi có tool results, gửi lại ngay (không cần user message mới)
      const followUp = await chat.sendMessage(toolResults);
      const followUpResponse = followUp.response;
      const followUpParts = followUpResponse.candidates?.[0]?.content?.parts || [];
      const followUpText = followUpParts.filter(p => p.text).map(p => p.text).join('');
      const followUpToolCalls = followUpParts.filter(p => p.functionCall);

      if (followUpToolCalls.length > 0) {
        // Vẫn còn tool calls nữa, tiếp tục vòng lặp
        history.push({ role: 'model', parts: followUpParts });
        currentMessage = '';
        continue;
      }

      // Gemini đã có câu trả lời cuối, stream về client
      if (followUpText) {
        // Stream từng từ
        const words = followUpText.split(' ');
        for (const word of words) {
          res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
          await new Promise(r => setTimeout(r, 10)); // Nhỏ delay để mượt hơn
        }
      }
      break;
    }

    // ─── Nếu Gemini trả lời thẳng không cần tool ────────────────────────────
    if (textParts.length > 0) {
      const fullText = textParts.map(p => p.text).join('');
      const words = fullText.split(' ');
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise(r => setTimeout(r, 10));
      }
      break;
    }

    // Trường hợp không có gì
    break;
  }

  // Gửi signal kết thúc stream
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}
