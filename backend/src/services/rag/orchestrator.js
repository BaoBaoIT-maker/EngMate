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

// ─── Danh sách các model theo thứ tự ưu tiên fallback khi Google gặp lỗi 503 / 429 ──
const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash'
];

async function generateContentWithFailover(genai, contents, tools) {
  let lastError = null;

  // Lấy model ưu tiên từ biến môi trường (nếu hợp lệ)
  const envModel = process.env.GEMINI_MODEL;
  const preferredModel = (envModel && !envModel.includes('2.5-flash') && !envModel.includes('3.6-flash'))
    ? envModel
    : null;

  const modelList = preferredModel
    ? [preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== preferredModel)]
    : CANDIDATE_MODELS;

  for (const modelName of modelList) {
    try {
      const model = genai.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        tools,
      });
      const result = await model.generateContent({ contents });
      return { result, modelName };
    } catch (err) {
      console.warn(`[AdvisorAgent] Model ${modelName} encountered error (status: ${err.status}): ${err.message}. Trying next fallback model...`);
      lastError = err;
      // Nếu là lỗi 503 (High demand / Service Unavailable), 429 (Quota / Rate Limit), hoặc 404
      if (err.status === 503 || err.status === 429 || err.status === 404 || err.status === 500) {
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

/**
 * Orchestrator chính: Nhận câu hỏi của user, chạy vòng lặp agentic với Gemini + Tool Calling
 * và stream kết quả về cho client.
 *
 * @param {string} userMessage - Câu hỏi của người dùng
 * @param {number} userId - ID của user đang đăng nhập
 * @param {import('express').Response} res - Express response object để stream
 * @param {Array} history - Lịch sử hội thoại multi-turn từ client
 */
export async function runAdvisorAgent(userMessage, userId, res, history = []) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ (Render Environment).');
  }

  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Làm sạch và chuẩn hoá lịch sử hội thoại từ client
  const cleanHistory = [];
  if (Array.isArray(history)) {
    for (const turn of history) {
      if (turn?.role && Array.isArray(turn.parts) && turn.parts.length > 0) {
        const textParts = turn.parts
          .filter((p) => p && typeof p.text === 'string' && p.text.trim())
          .map((p) => ({ text: p.text }));
        if (textParts.length > 0) {
          cleanHistory.push({
            role: turn.role === 'model' ? 'model' : 'user',
            parts: textParts
          });
        }
      }
    }
  }

  // Danh sách hội thoại truyền vào generateContent
  const contents = [
    ...cleanHistory,
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const MAX_ITERATIONS = 5;
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    const { result } = await generateContentWithFailover(
      genai,
      contents,
      [{ functionDeclarations: TOOL_DEFINITIONS }]
    );
    const candidate = result.response.candidates?.[0];

    if (!candidate) {
      res.write(`data: ${JSON.stringify({ error: 'Không có phản hồi từ AI.' })}\n\n`);
      break;
    }

    const parts = candidate.content?.parts || [];
    const toolCallParts = parts.filter((p) => p.functionCall);
    const textParts = parts.filter((p) => p.text);

    // ─── Nếu Gemini yêu cầu gọi tools ────────────────────────────────────────
    if (toolCallParts.length > 0) {
      // Lưu turn phản hồi của model chứa tool calls vào contents
      contents.push({ role: 'model', parts });

      // Thực thi các tools song song
      const toolResults = await Promise.all(
        toolCallParts.map(async (part) => {
          const { name, args } = part.functionCall;
          const executor = TOOL_EXECUTOR_MAP[name];

          let toolResult;
          if (executor) {
            try {
              toolResult = await executor(args || {}, userId);
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

      // Lưu kết quả tool vào contents với role 'user' (chuẩn Gemini v1beta API)
      contents.push({ role: 'user', parts: toolResults });
      continue;
    }

    // ─── Nếu Gemini trả lời text kết quả ────────────────────────────────────
    if (textParts.length > 0) {
      const fullText = textParts.map((p) => p.text).join('');
      const words = fullText.split(' ');
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise((r) => setTimeout(r, 10));
      }
      break;
    }

    break;
  }

  // Gửi signal kết thúc stream
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}
