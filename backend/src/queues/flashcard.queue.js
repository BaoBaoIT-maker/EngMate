import { Queue, Worker } from 'bullmq';
import { connection } from '../config/queueRedis.js';
import { processFlashcardReview } from '../services/flashcard.service.js';

export const flashcardQueue = new Queue('FlashcardQueue', { connection });

export const flashcardWorker = connection ? new Worker('FlashcardQueue', async (job) => {
  const { userId, flashcardId, quality } = job.data;
  
  try {
    await processFlashcardReview(userId, flashcardId, quality);
    console.log(`[FlashcardWorker] Processed review for user ${userId}, flashcard ${flashcardId}`);
  } catch (error) {
    console.error(`[FlashcardWorker] Failed to process review for flashcard ${flashcardId}`, error);
    throw error;
  }
}, { connection }) : null;

if (flashcardWorker) {
  flashcardWorker.on('failed', (job, err) => {
    console.error(`[FlashcardWorker] Job ${job.id} failed with error ${err.message}`);
  });
}
