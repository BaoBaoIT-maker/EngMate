import { Queue } from 'bullmq';
import { connection } from '../config/queueRedis.js';

const progressQueue = new Queue('progressQueue', {
  connection,
});

/**
 * Enqueue job tính lại tiến độ học tập cho user theo category.
 *
 * Cơ chế Fixed-Window Deduplication:
 * - jobId tĩnh = `recalc:${userId}:${categoryCode}`
 * - Nếu job này đang ở trạng thái waiting/delayed → BullMQ bỏ qua, không tạo thêm.
 * - delay 5s → gom nhiều review liên tiếp thành 1 lần chạy Worker.
 * - removeOnComplete: true → sau khi job hoàn thành, xóa đi để lần sau jobId đó được dùng lại.
 *
 * @param {number} userId
 * @param {string} categoryCode
 */
export const enqueueProgressUpdate = async (userId, categoryCode) => {
  const jobId = `recalc:${userId}:${categoryCode}`;
  await progressQueue.add(
    'recalculate',
    { userId, categoryCode },
    {
      jobId,
      delay:            5000,
      removeOnComplete: true,
      removeOnFail:     false, // Giữ lại failed jobs để debug
      attempts:         3,
      backoff: { type: 'exponential', delay: 1000 },
    }
  );
};
