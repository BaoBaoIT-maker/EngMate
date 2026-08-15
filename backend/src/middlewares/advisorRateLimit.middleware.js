import { cacheGetJson, cacheSetJson } from '../config/redis.js';
import prisma from '../config/prisma.js';

/**
 * Rate Limit cho AI Advisor:
 *   Giới hạn ngày:
 *       Free:    5 câu hỏi / ngày
 *       Premium: 30 câu hỏi / ngày
 */
export default async function advisorRateLimitMiddleware(req, res, next) {
  const userId = req.user.id;

  try {
    // Lấy thông tin gói cước của user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } }
    });

    const isPremium =
      user?.subscription?.isValid &&
      user?.subscription?.plan?.code !== 'FREE' &&
      (!user.subscription.endDate || new Date(user.subscription.endDate) > new Date());

    const DAILY_LIMIT = isPremium ? 30 : 5;
    const dailyKey = `engmate:advisor:daily:${userId}`;


    // ─── Lớp 2: Kiểm tra per-day ─────────────────────────────────────────────
    let dailyData = null;
    try {
      dailyData = await cacheGetJson(dailyKey);
    } catch (e) {
      return next();
    }

    const now = Date.now();
    if (dailyData && dailyData.count >= DAILY_LIMIT) {
      const resetTime = new Date(dailyData.resetAt).toLocaleTimeString('vi-VN');
      return res.status(429).json({
        success: false,
        message: 'RATE_LIMITED_DAILY',
        retryAfter: Math.ceil((dailyData.resetAt - now) / 1000),
        detail: isPremium
          ? `Bạn đã dùng hết ${DAILY_LIMIT} câu hỏi hôm nay. Giới hạn sẽ reset lúc ${resetTime}.`
          : `Bạn đã dùng hết ${DAILY_LIMIT} câu hỏi/ngày của gói Free. Nâng cấp Premium để có 30 câu/ngày!`
      });
    }

    // ─── Tất cả pass → cập nhật counters ──────────────────────────────────────
    // Tính TTL cho daily key (đến 00:00 ngày hôm sau)
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const secondsUntilMidnight = Math.ceil((midnight.getTime() - now) / 1000);

    await Promise.all([
      // Tăng daily counter
      cacheSetJson(
        dailyKey,
        {
          count: (dailyData?.count || 0) + 1,
          resetAt: midnight.getTime()
        },
        secondsUntilMidnight
      )
    ]);

    // Truyền thông tin giới hạn cho controller biết (để trả header cho FE)
    req.rateLimit = {
      daily: { used: (dailyData?.count || 0) + 1, limit: DAILY_LIMIT },
      isPremium
    };

    next();
  } catch (error) {
    console.error('[AdvisorRateLimit] Error:', error);
    next(); // Graceful degradation
  }
}
