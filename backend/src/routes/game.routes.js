import express from 'express';
import * as gameController from '../controllers/game.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/configs', gameController.getGameConfigs);
router.get('/matching/data', gameController.getMatchingData);
router.get('/fill-blank/data', gameController.getFillBlankData);
router.post('/submit', gameController.submitGameResult);

export default router;
