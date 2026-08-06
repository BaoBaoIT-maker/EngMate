import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo instance Gemini AI dùng chung cho toàn bộ app
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const defaultModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * AI tự động sinh nội dung cho Flashcard (Từ vựng) - Hỗ trợ sinh nhiều từ cùng lúc
 * @param {string|string[]} words - Một từ tiếng Anh hoặc một mảng các từ
 * @returns {object|array} JSON object (nếu truyền string) hoặc Array JSON objects (nếu truyền array)
 */
export const generateFlashcardContent = async (words) => {
  const model = genAI.getGenerativeModel({ model: defaultModel });
  const isArray = Array.isArray(words);
  const wordsList = isArray ? words.join(', ') : words;
  
  const prompt = `
Bạn là giáo viên tiếng Anh đang giúp học sinh người Việt học từ vựng.
Tôi cần thông tin về danh sách các từ tiếng Anh sau: "${wordsList}".

Nếu có từ nào bị viết sai chính tả, hãy tự động sửa lại thành từ đúng và dùng từ đúng đó để sinh nội dung.

Hãy trả về DUY NHẤT một MẢNG JSON (JSON Array) chứa dữ liệu cho TỪNG từ. Mỗi object trong mảng có cấu trúc sau (không có markdown, không có text thừa):
[
  {
    "word": "từ tiếng Anh đúng chính tả (sửa nếu sai)",
    "phonetic": "phiên âm IPA, ví dụ /həˈləʊ/",
    "meaning": "nghĩa tiếng Việt ngắn gọn, ví dụ: kế hoạch, toàn diện, yêu thương",
    "definition": "giải thích nghĩa bằng tiếng Việt, một câu rõ ràng, dễ hiểu",
    "examples": ["Câu ví dụ tiếng Anh 1", "Câu ví dụ tiếng Anh 2"]
  }
]

YÊU CẦU BẮT BUỘC:
- Mảng trả về phải chứa đủ số lượng object tương ứng với số từ yêu cầu hợp lệ.
- Trường "word": phải là từ tiếng Anh đúng chính tả.
- Trường "meaning": tiếng Việt.
- Trường "definition": giải thích bằng tiếng Việt.
- Trường "examples": câu ví dụ tiếng Anh.
- Chỉ trả về JSON thuần, không có \`\`\`json hay bất kỳ ký tự nào khác.
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  try {
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    // Nếu đầu vào là 1 chuỗi, trả về object đầu tiên; nếu là mảng, trả về toàn bộ mảng
    return isArray ? parsed : (parsed[0] || {});
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
