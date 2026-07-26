import { EventEmitter } from 'events';
import prisma from '../../config/prisma.js';
import { cacheDelete } from '../../config/redis.js';

// Khởi tạo Event Emitter (Observer Pattern)
class PaymentEventEmitter extends EventEmitter {}
export const paymentEvents = new PaymentEventEmitter();

// Lắng nghe sự kiện PAYMENT_SUCCESS
paymentEvents.on('PAYMENT_SUCCESS', async ({ userId, planId, amount, transactionCode }) => {
  try {
    console.log(`[Webhook] User ${userId} transferred ${amount}đ, claimed plan id=${planId}`);

    // 1. Lấy thông tin gói từ DB
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      console.warn(`[Webhook] ⚠️ Không tìm thấy gói cước id=${planId}`);
      return;
    }

    // ✅ BẢO MẬT: Kiểm tra số tiền thực tế chuyển >= giá gói
    if (amount < plan.price) {
      console.warn(
        `[Webhook] ❌ FRAUD: User ${userId} chuyển ${amount}đ nhưng gói [${plan.code}] cần ${plan.price}đ → Từ chối!`
      );
      return;
    }

    // 2. Xác định thời gian gói
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // 3. Cập nhật Subscription trong DB
    await prisma.userSubscription.upsert({
      where: { userId },
      update: { planId: plan.id, startDate, endDate, isValid: true },
      create: { userId, planId: plan.id, startDate, endDate, isValid: true },
    });

    console.log(`[Webhook] ✅ VIP [${plan.code}] activated for User ${userId} until ${endDate.toLocaleDateString('vi-VN')}`);

    // Xóa Redis cache để Frontend polling nhận data mới ngay lập tức
    await cacheDelete(`engmate:user:me:${userId}`);

  } catch (error) {
    console.error(`[Webhook] ❌ Error processing payment for User ${userId}:`, error.message);
  }
});
