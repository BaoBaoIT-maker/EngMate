import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';
import {
  getMyConversation,
  getMessages,
  sendMessage,
  getAllConversations
} from '../controllers/support.controller.js';

const router = express.Router();

router.use(authenticate);

// --- User routes ---
router.get('/my', getMyConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

// --- Admin routes ---
router.get('/', requireAdmin, getAllConversations);

export default router;
