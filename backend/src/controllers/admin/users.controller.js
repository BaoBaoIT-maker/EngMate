import prisma from '../../config/prisma.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { cacheDelete } from '../../config/redis.js';

const userCacheKey = (userId) => `engmate:user:me:${userId}`;

// GET /admin/users
export const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { profile: { username: { contains: search } } },
      ];
    }
    if (role === 'ADMIN' || role === 'USER') where.role = role;
    if (status === 'banned') where.isBanned = true;
    if (status === 'active') where.isBanned = false;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isBanned: true,
          bannedAt: true,
          isVerified: true,
          createdAt: true,
          profile: { select: { username: true, avatarUrl: true } },
          subscription: {
            select: { isValid: true, endDate: true, plan: { select: { name: true, code: true } } },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess(res, {
      users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    }, 'Users list');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// GET /admin/users/:id
export const getUserDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        setting: true,
        skill: true,
        subscription: { include: { plan: true } },
        learningPaths: { where: { isActive: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, user, 'User detail');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// PATCH /admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { username, role } = req.body;

    const updates = {};
    if (role === 'ADMIN' || role === 'USER') updates.role = role;

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({ where: { id }, data: updates });
    }
    if (username) {
      await prisma.userProfile.update({ where: { userId: id }, data: { username } });
    }

    await cacheDelete(userCacheKey(id));
    return sendSuccess(res, null, 'User updated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// PATCH /admin/users/:id/ban
export const toggleBan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id }, select: { isBanned: true } });
    if (!user) return sendError(res, 'User not found', 404);

    const newBanned = !user.isBanned;
    await prisma.user.update({
      where: { id },
      data: { isBanned: newBanned, bannedAt: newBanned ? new Date() : null },
    });

    await cacheDelete(userCacheKey(id));
    return sendSuccess(res, { isBanned: newBanned }, newBanned ? 'User banned' : 'User unbanned');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// POST /admin/users/:id/grant-plan
export const grantPlan = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { planId } = req.body;

    if (!planId) return sendError(res, 'planId is required', 400);

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parseInt(planId) } });
    if (!plan) return sendError(res, 'Plan not found', 404);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    await prisma.userSubscription.upsert({
      where: { userId },
      update: { planId: plan.id, startDate, endDate, isValid: true },
      create: { userId, planId: plan.id, startDate, endDate, isValid: true },
    });

    await cacheDelete(userCacheKey(userId));
    return sendSuccess(res, null, `Granted plan [${plan.name}] to user ${userId}`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
