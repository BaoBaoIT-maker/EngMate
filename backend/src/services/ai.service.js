import { generateContentWithFailover } from '../config/gemini.js';

export const generateFlashcardContent = async (words) => {
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
    "type": "loại từ bằng tiếng Anh, ví dụ: noun, verb, adjective, adverb, pronoun",
    "phonetic": "phiên âm IPA, ví dụ /həˈləʊ/",
    "meaning": "nghĩa tiếng Việt ngắn gọn, ví dụ: kế hoạch, toàn diện, yêu thương",
    "definition": "giải thích nghĩa bằng tiếng Việt, một câu rõ ràng, dễ hiểu",
    "examples": ["Câu ví dụ tiếng Anh 1", "Câu ví dụ tiếng Anh 2"]
  }
]

YÊU CẦU BẮT BUỘC:
- Mảng trả về phải chứa đủ số lượng object tương ứng với số từ yêu cầu hợp lệ.
- Trường "word": phải là từ tiếng Anh đúng chính tả.
- Trường "type": phải là loại từ phù hợp nhất với từ đó, viết bằng tiếng Anh, chữ thường.
- Trường "meaning": tiếng Việt.
- Trường "definition": giải thích bằng tiếng Việt.
- Trường "examples": câu ví dụ tiếng Anh.
- Chỉ trả về JSON thuần, không có \`\`\`json hay bất kỳ ký tự nào khác.
  `;

  const { result } = await generateContentWithFailover({
    prompt,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });
  const responseText = result.response.text();
  
  const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);
  // Nếu đầu vào là 1 chuỗi, trả về object đầu tiên; nếu là mảng, trả về toàn bộ mảng
  return isArray ? parsed : (parsed[0] || {});
};
