import 'dotenv/config';
import assert from 'assert';
import { generateFlashcardContent } from '../services/ai.service.js';

async function selfCheck() {
  console.log('--- RUNNABLE CHECK: Test generateFlashcardContent ---');
  const t0 = performance.now();
  
  const result = await generateFlashcardContent('serendipity');
  const duration = Math.round(performance.now() - t0);

  console.log(`⏱️ Thời gian phản hồi: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
  console.log('Kết quả trả về:', JSON.stringify(result, null, 2));

  // Assert các trường bắt buộc
  assert.strictEqual(typeof result.word, 'string', 'word phải là string');
  assert.strictEqual(typeof result.phonetic, 'string', 'phonetic phải là string');
  assert.strictEqual(typeof result.meaning, 'string', 'meaning phải là string');
  // Test case 2: Mảng nhiều từ (Dành cho Admin gen hàng loạt)
  const t1 = performance.now();
  const batchResult = await generateFlashcardContent(['resilient', 'meticulous']);
  const durationBatch = Math.round(performance.now() - t1);
  console.log(`⏱️ Thời gian phản hồi mảng 2 từ: ${durationBatch}ms (${(durationBatch / 1000).toFixed(2)}s)`);
  assert.ok(Array.isArray(batchResult), 'batchResult phải là array');
  assert.strictEqual(batchResult.length, 2, 'Phải trả về đúng 2 từ');

  console.log('✅ ALL ASSERTS PASSED! Cả từ đơn và mảng từ đều đạt chuẩn tốc độ.');
}

selfCheck().catch((err) => {
  console.error('❌ Check thất bại:', err);
  process.exit(1);
});
