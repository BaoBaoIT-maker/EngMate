import 'dotenv/config';
import assert from 'assert';
import prisma from '../config/prisma.js';
import { getTopics, getFlashcardSession } from '../services/flashcard.service.js';

async function selfCheck() {
  console.log('--- RUNNABLE CHECK: Test Flashcard Session Speed & Learned Count Accuracy ---');
  
  // Lấy 1 user bất kỳ trong hệ thống
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('Không có user để test, bỏ qua.');
    return;
  }

  // Lấy 1 topic bất kỳ
  const topic = await prisma.vocabularyTopic.findFirst({
    where: { vocabularies: { some: {} } }
  });
  if (!topic) {
    console.log('Không có topic để test, bỏ qua.');
    return;
  }

  console.log(`Kiểm tra với User ID: ${user.id}, Topic: "${topic.name}" (ID: ${topic.id})`);

  // 1. Đo tốc độ nạp session
  const t0 = performance.now();
  const sessionCards = await getFlashcardSession(user.id, {
    type: 'topic',
    topicId: topic.id,
    mode: 'learn'
  });
  const duration = Math.round(performance.now() - t0);

  console.log(`⏱️ Thời gian nạp session: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
  console.log(`Số lượng thẻ nhận được: ${sessionCards.length}`);
  assert.ok(Array.isArray(sessionCards), 'sessionCards phải là Array');
  assert.ok(duration < 2500, `Thời gian nạp phải dưới 2.5s (thực tế: ${duration}ms)`);

  // 2. Kiểm tra tính chính xác của getTopics (đảm bảo không bị tính 100% nếu từ chưa học)
  const topics = await getTopics(user.id);
  const targetTopic = topics.find(t => t.id === topic.id);
  assert.ok(targetTopic, 'Topic phải tồn tại trong danh sách');
  
  // Đếm số từ thực tế có repetitions > 0 của user trong topic này
  const actualReviewedCount = await prisma.flashcard.count({
    where: {
      userId: user.id,
      systemVocabulary: { topicId: topic.id },
      progress: { repetitions: { gt: 0 } }
    }
  });

  console.log(`learnedCount tính bởi getTopics: ${targetTopic.learnedCount}`);
  console.log(`Số từ thực sự đã ôn tập (repetitions > 0): ${actualReviewedCount}`);
  assert.strictEqual(
    targetTopic.learnedCount,
    actualReviewedCount,
    'learnedCount phải trùng khớp với số từ đã học thực sự (repetitions > 0), không được tính 100% khi chưa học!'
  );

  console.log('✅ ALL ASSERTS PASSED! Session load nhanh và tiến độ chính xác 100%.');
  process.exit(0);
}

selfCheck()
  .catch(err => {
    console.error('❌ Check thất bại:', err);
    process.exit(1);
  });
