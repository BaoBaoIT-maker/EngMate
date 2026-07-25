import express from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/session', chatController.createSession);
router.get('/session', chatController.getSessions);
router.get('/session/:id', chatController.getSessionMessages);

router.post('/message', chatController.streamMessage);

export default router;
