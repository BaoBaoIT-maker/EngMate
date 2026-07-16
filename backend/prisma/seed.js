import prismaClientPkg from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const { PrismaClient } = prismaClientPkg;

// Khởi tạo Prisma với MariaDB adapter (giống src/config/prisma.js)
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');
const parsedUrl = new URL(databaseUrl);
const adapter = new PrismaMariaDb({
  host: parsedUrl.hostname,
  user: decodeURIComponent(parsedUrl.username),
  password: decodeURIComponent(parsedUrl.password),
  database: parsedUrl.pathname.replace(/^\//, ''),
});
const prisma = new PrismaClient({ adapter });

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// =====================================================
// DANH SÁCH 10 TOPIC CẦN SEED
// =====================================================
const TOPICS = [
  // TOEIC - 5 topics
  {
    name: 'TOEIC - Nhân sự & Hành chính',
    description: 'Từ vựng về tuyển dụng, hợp đồng, quản lý nhân viên và các thủ tục hành chính văn phòng.',
    category: 'TOEIC',
    level: 'B1',
    isPremium: false,
  },
  {
    name: 'TOEIC - Tài chính & Kế toán',
    description: 'Từ vựng về ngân hàng, đầu tư, báo cáo tài chính và các giao dịch kinh tế.',
    category: 'TOEIC',
    level: 'B2',
    isPremium: false,
  },
  {
    name: 'TOEIC - Marketing & Kinh doanh',
    description: 'Từ vựng về chiến lược marketing, quảng cáo, phân tích thị trường và bán hàng.',
    category: 'TOEIC',
    level: 'B1',
    isPremium: false,
  },
  {
    name: 'TOEIC - Sản xuất & Hậu cần',
    description: 'Từ vựng về chuỗi cung ứng, vận chuyển hàng hóa, kiểm soát chất lượng và kho bãi.',
    category: 'TOEIC',
    level: 'B2',
    isPremium: true,
  },
  {
    name: 'TOEIC - Họp & Thuyết trình',
    description: 'Từ vựng dùng trong các buổi họp, hội thảo, thuyết trình và giao tiếp chuyên nghiệp.',
    category: 'TOEIC',
    level: 'B1',
    isPremium: true,
  },
  // IELTS - 3 topics
  {
    name: 'IELTS - Khoa học & Môi trường',
    description: 'Từ vựng học thuật về biến đổi khí hậu, bảo tồn môi trường và nghiên cứu khoa học.',
    category: 'IELTS',
    level: 'C1',
    isPremium: false,
  },
  {
    name: 'IELTS - Xã hội & Văn hóa',
    description: 'Từ vựng học thuật về các vấn đề xã hội, đa dạng văn hóa và toàn cầu hóa.',
    category: 'IELTS',
    level: 'B2',
    isPremium: false,
  },
  {
    name: 'IELTS - Công nghệ & Đổi mới',
    description: 'Từ vựng học thuật về trí tuệ nhân tạo, tự động hóa và ảnh hưởng của công nghệ.',
    category: 'IELTS',
    level: 'C1',
    isPremium: true,
  },
  // GENERAL - 2 topics
  {
    name: 'Giao tiếp hàng ngày',
    description: 'Bộ từ vựng thiết yếu nhất cho giao tiếp tiếng Anh hàng ngày, phù hợp cho người mới bắt đầu.',
    category: 'GENERAL',
    level: 'A2',
    isPremium: false,
  },
  {
    name: 'Cảm xúc & Tính cách',
    description: 'Từ vựng miêu tả cảm xúc, tính cách và trạng thái tâm lý của con người.',
    category: 'GENERAL',
    level: 'B1',
    isPremium: false,
  },
];

// =====================================================
// HÀM GỌI GEMINI ĐỂ SINH TỪ VỰNG (có tự retry khi bị 429)
// =====================================================
async function generateVocabularyWithGemini(topic, retries = 5) {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

  const prompt = `Generate exactly 30 English vocabulary words for the topic "${topic.name}" (${topic.category}, level ${topic.level}).
Return ONLY a valid JSON array (no markdown, no extra text). Each item must have exactly these fields:
[
  {
    "word": "string",
    "type": "noun|verb|adjective|adverb|phrase",
    "phonetic": "/pronunciation/",
    "definitionText": "Clear English definition",
    "vietnameseMeaning": "Nghĩa tiếng Việt ngắn gọn",
    "exampleJson": ["Example sentence 1.", "Example sentence 2."]
  }
]
Make sure all 30 words are relevant to the topic context. Do not repeat words.`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      // Loại bỏ markdown code block nếu Gemini trả về
      const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      const is429 = err.message?.includes('429') || err.message?.includes('Too Many Requests');
      // Trích xuất thời gian retry từ message nếu có (VD: "retry in 48s")
      const retryMatch = err.message?.match(/retry[^0-9]*(\d+)/i);
      const waitSeconds = retryMatch ? parseInt(retryMatch[1]) + 5 : 60;

      if (is429 && attempt < retries) {
        console.log(`    ⏳ Rate limit (429). Chờ ${waitSeconds}s rồi thử lại (lần ${attempt}/${retries})...`);
        await sleep(waitSeconds * 1000);
        continue;
      }
      throw err;
    }
  }
}

// =====================================================
// HÀM SLEEP ĐỂ TRÁNH RATE LIMIT
// =====================================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// =====================================================
// MAIN SEED FUNCTION
// =====================================================
async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu từ vựng...\n');

  for (const topicData of TOPICS) {
    console.log(`📚 Đang xử lý topic: "${topicData.name}"...`);

    // 1. Tạo hoặc cập nhật topic trong DB
    const topic = await prisma.vocabularyTopic.upsert({
      where: { name: topicData.name },
      update: {},
      create: {
        name: topicData.name,
        description: topicData.description,
        category: topicData.category,
        level: topicData.level,
        isPremium: topicData.isPremium,
        wordCount: 0,
      },
    });

    console.log(`  ✅ Topic ID=${topic.id} đã được tạo/cập nhật.`);
    console.log(`  🤖 Đang gọi Gemini API để sinh 30 từ...`);

    let words;
    try {
      words = await generateVocabularyWithGemini(topicData);
    } catch (err) {
      console.error(`  ❌ Lỗi gọi Gemini: ${err.message}. Bỏ qua topic này.`);
      continue;
    }

    console.log(`  📝 Gemini trả về ${words.length} từ. Đang lưu vào DB...`);

    // 2. Lưu từng từ vựng vào DB
    let insertedCount = 0;
    for (const w of words) {
      try {
        await prisma.systemVocabulary.create({
          data: {
            topicId: topic.id,
            word: w.word,
            type: w.type || 'noun',
            phonetic: w.phonetic || '',
            definitionText: w.definitionText || '',
            vietnameseMeaning: w.vietnameseMeaning || '',
            exampleJson: w.exampleJson || [],
            category: topicData.category,
            level: topicData.level,
          },
        });
        insertedCount++;
      } catch (err) {
        console.warn(`    ⚠️  Bỏ qua từ "${w.word}": ${err.message}`);
      }
    }

    // 3. Cập nhật wordCount cho topic
    await prisma.vocabularyTopic.update({
      where: { id: topic.id },
      data: { wordCount: insertedCount },
    });

    console.log(`  ✅ Đã lưu ${insertedCount} từ cho topic "${topicData.name}"\n`);

    // Chờ 1.5 giây giữa các lần gọi Gemini để tránh rate limit
    await sleep(1500);
  }

  console.log('🎉 Seed hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
