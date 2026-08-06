import prisma from '../../config/prisma.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { cacheGetJson, cacheSetJson } from '../../config/redis.js';

const CACHE_KEY_OVERVIEW = 'admin:stats:overview';
const CACHE_TTL = 15 * 60; // 15 phút

// GET /admin/stats/overview
export const getOverview = async (req, res) => {
  try {
    // const cached = await cacheGetJson(CACHE_KEY_OVERVIEW);
    // if (cached) return sendSuccess(res, cached, 'Overview stats (cached)');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersToday,
      totalRevenue,
      subscriptionsByPlan,
      activePremiumCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.userSubscription.groupBy({
        by: ['planId'],
        _count: { planId: true },
        where: { isValid: true },
      }),
      prisma.userSubscription.count({
        where: {
          isValid: true,
          plan: { code: { not: 'FREE' } },
          endDate: { gt: new Date() },
        },
      }),
    ]);

    // Map planId → plan name
    const plans = await prisma.subscriptionPlan.findMany({ select: { id: true, name: true, code: true } });
    const planMap = Object.fromEntries(plans.map(p => [p.id, p]));
    const planBreakdown = subscriptionsByPlan.map(g => ({
      plan: planMap[g.planId] || { id: g.planId, name: 'Unknown', code: '?' },
      count: g._count.planId,
    }));

    const data = {
      totalUsers,
      newUsersToday,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      activePremiumCount,
      planBreakdown,
    };

    await cacheSetJson(CACHE_KEY_OVERVIEW, data, CACHE_TTL);
    return sendSuccess(res, data, 'Overview stats');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// GET /admin/stats/revenue?period=7d|30d|12m
export const getRevenue = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const now = new Date();
    let startDate, groupFormat, labelFn;

    if (period === '7d') {
      startDate = new Date(now - 7 * 86400000);
      groupFormat = '%Y-%m-%d';
      labelFn = (r) => r.date;
    } else if (period === '30d') {
      startDate = new Date(now - 30 * 86400000);
      groupFormat = '%Y-%m-%d';
      labelFn = (r) => r.date;
    } else if (period === '12m') {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 12);
      groupFormat = '%Y-%m';
      labelFn = (r) => r.date;
    } else {
      return sendError(res, 'Invalid period. Use 7d, 30d, or 12m', 400);
    }

    // Raw query vì Prisma chưa hỗ trợ GROUP BY date format
    const rows = await prisma.$queryRaw`
      SELECT DATE_FORMAT(transaction_date, ${groupFormat}) as date,
             SUM(amount) as total,
             COUNT(*) as count
      FROM transactions
      WHERE status = 'SUCCESS' AND transaction_date >= ${startDate}
      GROUP BY date
      ORDER BY date ASC
    `;

    const data = rows.map(r => ({
      label: r.date,
      total: Number(r.total || 0),
      count: Number(r.count || 0),
    }));

    return sendSuccess(res, data, 'Revenue stats');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// GET /admin/stats/users?period=7d|30d
export const getUserGrowth = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : 30;
    const startDate = new Date(Date.now() - days * 86400000);

    const rows = await prisma.$queryRaw`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date,
             COUNT(*) as count
      FROM users
      WHERE created_at >= ${startDate}
      GROUP BY date
      ORDER BY date ASC
    `;

    const data = rows.map(r => ({
      label: r.date,
      count: Number(r.count || 0),
    }));

    return sendSuccess(res, data, 'User growth stats');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
