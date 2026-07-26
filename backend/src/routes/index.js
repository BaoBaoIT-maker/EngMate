import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import vocabularyRoutes from './vocabulary.routes.js';
import flashcardRoutes from './flashcard.routes.js';
import chatRoutes from './chat.routes.js';
import statRoutes from './stat.routes.js';
import gameRoutes from './game.routes.js';
import paymentRoutes from './payment.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vocabulary', vocabularyRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/chat', chatRoutes);
router.use('/stats', statRoutes);
router.use('/games', gameRoutes);
router.use('/payment', paymentRoutes);

export default router;