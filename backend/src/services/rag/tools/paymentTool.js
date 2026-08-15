import prisma from '../../../config/prisma.js';

/**
 * Tool 9: Lấy lịch sử thanh toán của user
 */
export const getPaymentHistoryTool = {
  name: 'get_payment_history',
  description: `Lấy lịch sử giao dịch thanh toán của user: số tiền, trạng thái (thành công/thất bại/chờ xử lý), ngày giao dịch, gói cước đã mua.
Gọi khi user hỏi về lịch sử thanh toán: "tôi đã thanh toán bao nhiêu lần", "giao dịch gần nhất của tôi", "tôi đã trả bao nhiêu tiền", "lịch sử mua gói của tôi", "tôi có bị trừ tiền không".`,

  /**
   * @param {number} userId
   * @returns {Promise<string>}
   */
  execute: async (userId) => {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { transactionDate: 'desc' },
      take: 10,
      select: {
        sepayTranId: true,
        amount: true,
        status: true,
        gateway: true,
        transactionDate: true,
        plan: { select: { name: true, code: true } }
      }
    });

    if (!transactions.length) return 'Chưa có giao dịch thanh toán nào.';

    const statusLabel = {
      SUCCESS: 'Thành công ✅',
      PENDING: 'Đang chờ xử lý ⏳',
      FAILED: 'Thất bại ❌'
    };

    return JSON.stringify({
      totalTransactions: transactions.length,
      transactions: transactions.map(t => ({
        transactionId: t.sepayTranId,
        amount: `${Number(t.amount).toLocaleString('vi-VN')} VNĐ`,
        status: statusLabel[t.status] || t.status,
        gateway: t.gateway,
        plan: t.plan?.name || 'Không xác định',
        date: new Date(t.transactionDate).toLocaleDateString('vi-VN')
      }))
    });
  }
};
