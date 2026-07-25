import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo instance Gemini AI dùng chung cho toàn bộ app
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const defaultModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * AI tự động sinh nội dung cho Flashcard (Từ vựng)
 * @param {string} word - Từ vựng tiếng Anh cần sinh dữ liệu
 * @returns {object} JSON object chứa phonetic, meaning, definition, examples
 */
export const generateFlashcardContent = async (word) => {
  const model = genAI.getGenerativeModel({ model: defaultModel });
  
  const prompt = `
Bạn là giáo viên tiếng Anh đang giúp học sinh người Việt học từ vựng.
Tôi cần thông tin về từ tiếng Anh: "${word}".

Nếu từ trên bị viết sai chính tả, hãy tự động sửa lại thành từ đúng và dùng từ đúng đó để sinh nội dung.

Hãy trả về DUY NHẤT một JSON object với cấu trúc sau (không có markdown, không có text thừa):
{
  "word": "từ tiếng Anh đúng chính tả (sửa nếu sai)",
  "phonetic": "phiên âm IPA, ví dụ /həˈləʊ/",
  "meaning": "nghĩa tiếng Việt ngắn gọn, ví dụ: kế hoạch, toàn diện, yêu thương",
  "definition": "giải thích nghĩa bằng tiếng Việt, một câu rõ ràng, dễ hiểu",
  "examples": ["Câu ví dụ tiếng Anh 1", "Câu ví dụ tiếng Anh 2"]
}

YÊU CẦU BẮT BUỘC:
- Trường "word": phải là từ tiếng Anh đúng chính tả, tự sửa nếu người dùng gõ sai
- Trường "meaning": phải là tiếng Việt, KHÔNG được dùng tiếng Anh
- Trường "definition": phải giải thích bằng tiếng Việt, KHÔNG được dùng tiếng Anh
- Trường "examples": phải là câu ví dụ tiếng Anh (không dịch)
- Chỉ trả về JSON thuần, không có \`\`\`json hay bất kỳ ký tự nào khác
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  try {
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Failed to parse AI response: " + err.message);
  }
};

/**
 * (Tương lai) AI phân tích lỗi ngữ pháp
 */
// export const analyzeGrammar = async (text) => { ... }

/**
 * (Tương lai) AI Speaking Coach
 */
// export const getSpeakingFeedback = async (audioUrl) => { ... }
