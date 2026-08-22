import { Worker } from 'bullmq';
import { getQueueRedisConnection } from '../config/queueRedis.js';
import { recalculatePathProgress } from '../services/learningProgress.service.js';

/**
 * Worker tiêu thụ job từ progressQueue.
 *
 * Lifecycle:
 * - DEV: được import vào server.js để chạy cùng process.
 * - PROD: chạy riêng bằng lệnh: node src/workers/progress.worker.js
 *         → tách hẳn resource (CPU/RAM) khỏi API server.
 *
 * concurrency: 5 — SQL Aggregate là idempotent (chạy nhiều lần = cùng kết quả)
 * nên không cần lock, hoàn toàn an toàn khi chạy song song.
 */
const progressWorker = new Worker(
  'progressQueue',
  async (job) => {
    const { userId, categoryCode } = job.data;
    await recalculatePathProgress(userId, categoryCode);
  },
  {
    connection: getQueueRedisConnection(),
    concurrency: 5,
  }
);

progressWorker.on('completed', (job) => {
  console.log(`[ProgressWorker] ✅ Done — user=${job.data.userId} category=${job.data.categoryCode} jobId=${job.id}`);
});

progressWorker.on('failed', (job, err) => {
  console.error(`[ProgressWorker] ❌ Failed — jobId=${job?.id} user=${job?.data?.userId} error=${err.message}`);
});

progressWorker.on('stalled', (jobId) => {
  console.warn(`[ProgressWorker] ⚠️  Stalled — jobId=${jobId}`);
});

export default progressWorker;
