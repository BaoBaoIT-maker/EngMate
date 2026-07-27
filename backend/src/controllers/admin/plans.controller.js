import prisma from '../../config/prisma.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { cacheDelete } from '../../config/redis.js';

const PLANS_CACHE = 'engmate:payment:plans';

// GET /admin/plans
export const listPlans = async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });
    return sendSuccess(res, plans, 'Plans list');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// POST /admin/plans
export const createPlan = async (req, res) => {
  try {
    const { name, code, price, durationDays, features } = req.body;
    if (!name || !code || price == null || !durationDays) {
      return sendError(res, 'name, code, price, durationDays are required', 400);
    }

    const existing = await prisma.subscriptionPlan.findUnique({ where: { code } });
    if (existing) return sendError(res, `Plan with code "${code}" already exists`, 409);

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        code: code.toUpperCase(),
        price: parseInt(price),
        durationDays: parseInt(durationDays),
        features: features || {},
        isActive: true,
      },
    });

    await cacheDelete(PLANS_CACHE);
    return sendSuccess(res, plan, 'Plan created');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// PATCH /admin/plans/:id
export const updatePlan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price, durationDays, features } = req.body;

    const data = {};
    if (name) data.name = name;
    if (price != null) data.price = parseInt(price);
    if (durationDays != null) data.durationDays = parseInt(durationDays);
    if (features != null) data.features = features;

    const plan = await prisma.subscriptionPlan.update({ where: { id }, data });
    await cacheDelete(PLANS_CACHE);
    return sendSuccess(res, plan, 'Plan updated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// PATCH /admin/plans/:id/toggle
export const togglePlan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) return sendError(res, 'Plan not found', 404);

    const updated = await prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: !plan.isActive },
    });
    await cacheDelete(PLANS_CACHE);
    return sendSuccess(res, updated, `Plan ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
