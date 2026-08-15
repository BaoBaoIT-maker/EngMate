import prisma from '../../../config/prisma.js';

/**
 * Tool 2: Lấy thông tin hồ sơ cơ bản của user
 */
export const getUserProfileTool = {
  name: 'get_user_profile',
  description: `Lấy thông tin hồ sơ cơ bản của user đang đăng nhập: tên hiển thị, email, ngày tạo tài khoản, cấp độ tiếng Anh hiện tại.
Gọi khi user hỏi về thông tin tài khoản của họ, ví dụ: "tên tài khoản của tôi là gì", "tôi đăng ký từ bao giờ", "trình độ hiện tại của tôi là gì".`,

  /**
   * @param {number} userId
   * @returns {Promise<string>}
   */
  execute: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        createdAt: true,
        profile: { select: { username: true, bio: true } },
        skill: { select: { currentLevel: true, totalExp: true, streakDays: true } }
      }
    });

    if (!user) return 'Không tìm thấy thông tin tài khoản.';

    const joinedDate = new Date(user.createdAt).toLocaleDateString('vi-VN');
    return JSON.stringify({
      username: user.profile?.username || 'Chưa đặt tên',
      email: user.email,
      joinedDate,
      currentLevel: user.skill?.currentLevel || 'A1',
      totalExp: user.skill?.totalExp || 0,
      streakDays: user.skill?.streakDays || 0
    });
  }
};

/**
 * Tool 3: Lấy thông tin gói cước đang sử dụng
 */
export const getUserSubscriptionTool = {
  name: 'get_user_subscription',
  description: `Lấy thông tin gói cước hiện tại của user: tên gói (Free/Premium), ngày bắt đầu, ngày hết hạn, còn hiệu lực hay không.
Gọi khi user hỏi: "tôi đang dùng gói gì", "gói của tôi còn hạn không", "khi nào hết Premium", "tôi có được dùng AI Coach không", "tôi có phải trả tiền không".`,

  execute: async (userId) => {
    const sub = await prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true }
    });

    if (!sub) return 'Người dùng chưa có thông tin gói cước.';

    const now = new Date();
    const isExpired = sub.endDate && new Date(sub.endDate) < now;
    const endDate = sub.endDate ? new Date(sub.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn';
    const startDate = new Date(sub.startDate).toLocaleDateString('vi-VN');
    const status = !sub.isValid || isExpired ? 'Đã hết hạn / Không hợp lệ' : 'Đang hoạt động';

    return JSON.stringify({
      planName: sub.plan.name,
      planCode: sub.plan.code,
      price: `${sub.plan.price.toLocaleString('vi-VN')} VNĐ/tháng`,
      startDate,
      endDate,
      status,
      features: sub.plan.features
    });
  }
};
