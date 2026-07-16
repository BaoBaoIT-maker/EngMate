import express from 'express';
import * as vocabularyController from '../controllers/vocabulary.controller.js';

const router = express.Router();

// Public routes - không cần auth
router.get('/topics', vocabularyController.getTopics);
router.get('/topics/:id', vocabularyController.getTopicDetail);

export default router;
