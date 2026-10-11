import 'dotenv/config';
import assert from 'assert';
import prisma from '../config/prisma.js';
import { getOverviewStats } from '../services/stat.service.js';

async function testOverviewStats() {
  console.log('--- RUNNABLE CHECK: Test getOverviewStats Learned Words Accuracy ---');

  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('Không có user để test, bỏ qua.');
    process.exit(0);
  }

  const stats = await getOverviewStats(user.id);
  console.log('Stats lấy được:', {
    streak: stats.streak,
    totalExp: stats.totalExp,
    dailyGoal: stats.dailyGoal,
    memory: stats.memory,
  });

  // Đếm số từ có repetitions === 0 trong DB của user này
  const unlearnedCount = await prisma.studyProgress.count({
    where: {
      flashcard: { userId: user.id },
      repetitions: 0,
    },
  });

  // Tổng số từ trong memory
  const memoryTotal = stats.memory.needReview + stats.memory.learning + stats.memory.mastered;

  console.log(`Số từ mới chưa học (repetitions === 0): ${unlearnedCount}`);
  console.log(`Tổng từ trong Kho trí nhớ (memoryTotal): ${memoryTotal}`);

  // Đếm tổng số từ thực sự đã học (repetitions > 0)
  const actualLearnedInDb = await prisma.studyProgress.count({
    where: {
      flashcard: { userId: user.id },
      repetitions: { gt: 0 },
    },
  });

  console.log(`Tổng từ thực sự đã học trong DB (repetitions > 0): ${actualLearnedInDb}`);

  assert.strictEqual(
    memoryTotal,
    actualLearnedInDb,
    `Kho trí nhớ (${memoryTotal}) phải đúng bằng số từ thực sự đã học (${actualLearnedInDb}), không được tính ${unlearnedCount} từ chưa học!`
  );

  console.log('✅ ALL ASSERTS PASSED! getOverviewStats không bao giờ đếm các từ chưa học (repetitions === 0).');
  process.exit(0);
}

testOverviewStats().catch((err) => {
  console.error('❌ Check thất bại:', err);
  process.exit(1);
});
