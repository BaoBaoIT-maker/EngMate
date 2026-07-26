import { PaymentStrategy } from './payment.strategy.js';
import dotenv from 'dotenv';
dotenv.config();

export class VietQrStrategy extends PaymentStrategy {
  async generatePayment(userId, amount, planId) {
    const acqId = process.env.VIETQR_ACQ_ID;
    const accountNo = process.env.VIETQR_ACCOUNT_NO;
    const accountName = process.env.VIETQR_ACCOUNT_NAME;
    const template = process.env.VIETQR_TEMPLATE || 'compact2';

    // SePay/VietQR requires a unique memo to trace.
    // Dùng cú pháp này để code ngắn và SePay dễ quét.
    const memo = `EMVIP ${userId} ${planId}`;

    const qrUrl = `https://img.vietqr.io/image/${acqId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`;

    return {
      type: 'VIETQR',
      qrUrl,
      memo,
      amount,
      accountNo,
      accountName
    };
  }
}
