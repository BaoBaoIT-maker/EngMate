import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';
import * as statsCtrl from '../controllers/admin/stats.controller.js';
import * as usersCtrl from '../controllers/admin/users.controller.js';
import * as plansCtrl from '../controllers/admin/plans.controller.js';
import * as vocabCtrl from '../controllers/admin/vocabulary.controller.js';
import * as gamesCtrl from '../controllers/admin/games.controller.js';
import * as txCtrl from '../controllers/admin/transactions.controller.js';

const router = express.Router();

// Tất cả routes admin đều phải xác thực + có quyền ADMIN
router.use(authenticate, requireAdmin);

// ── Stats ────────────────────────────────────────────────────────────
router.get('/stats/overview', statsCtrl.getOverview);
router.get('/stats/revenue', statsCtrl.getRevenue);
router.get('/stats/users', statsCtrl.getUserGrowth);

// ── Users ────────────────────────────────────────────────────────────
router.get('/users', usersCtrl.listUsers);
router.get('/users/:id', usersCtrl.getUserDetail);
router.patch('/users/:id', usersCtrl.updateUser);
router.patch('/users/:id/ban', usersCtrl.toggleBan);
router.post('/users/:id/grant-plan', usersCtrl.grantPlan);

// ── Plans ────────────────────────────────────────────────────────────
router.get('/plans', plansCtrl.listPlans);
router.post('/plans', plansCtrl.createPlan);
router.patch('/plans/:id', plansCtrl.updatePlan);
router.patch('/plans/:id/toggle', plansCtrl.togglePlan);

// ── Categories ───────────────────────────────────────────────────────
router.get('/categories', vocabCtrl.listCategories);
router.post('/categories', vocabCtrl.createCategory);
router.patch('/categories/:id', vocabCtrl.updateCategory);

// ── Topics ───────────────────────────────────────────────────────────
router.get('/topics', vocabCtrl.listTopics);
router.post('/topics', vocabCtrl.createTopic);
router.patch('/topics/:id', vocabCtrl.updateTopic);
router.delete('/topics/:id', vocabCtrl.deleteTopic);

// ── Vocabularies ─────────────────────────────────────────────────────
router.get('/topics/:topicId/vocabularies', vocabCtrl.listVocabularies);
router.post('/topics/:topicId/vocabularies', vocabCtrl.createVocabulary);
router.post('/topics/:topicId/vocabularies/ai-generate', vocabCtrl.aiGenerateVocabulary);
router.patch('/vocabularies/:id', vocabCtrl.updateVocabulary);
router.delete('/vocabularies/:id', vocabCtrl.deleteVocabulary);

// ── Games ─────────────────────────────────────────────────────────────
router.get('/games/config', gamesCtrl.listGameConfigs);
router.patch('/games/config/:gameType', gamesCtrl.toggleGame);

// ── Transactions ──────────────────────────────────────────────────────
router.get('/transactions', txCtrl.listTransactions);

export default router;
