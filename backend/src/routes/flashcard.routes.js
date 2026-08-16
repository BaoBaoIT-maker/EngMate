import express from 'express';
import {
  getTopics,
  getSession,
  getLearnedWords,
  reviewFlashcard,
  createCustom,
  updateCustom,
  deleteFlashcard,
  generateAI
} from '../controllers/flashcard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/topics', getTopics);
router.get('/session', getSession);
router.get('/learned', getLearnedWords);
router.post('/:id/review', reviewFlashcard);
router.post('/custom', createCustom);
router.patch('/custom/:id', updateCustom);
router.delete('/:id', deleteFlashcard);
router.post('/ai-generate', generateAI);

export default router;
