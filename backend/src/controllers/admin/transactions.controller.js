import prisma from '../../config/prisma.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// GET /admin/transactions?page=&userId=&status=&startDate=&endDate=
export const listTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, status, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (userId) where.userId = parseInt(userId);
    if (status) where.status = status.toUpperCase();
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { transactionDate: 'desc' },
        include: {
          user: { select: { id: true, email: true, profile: { select: { username: true } } } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return sendSuccess(res, {
      transactions,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    }, 'Transactions list');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
