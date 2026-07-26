import { VietQrStrategy } from './vietqr.strategy.js';

export class PaymentContext {
  constructor() {
    this.strategies = {
      vietqr: new VietQrStrategy(),
    };
  }

  getStrategy(gateway = 'vietqr') {
    const strategy = this.strategies[gateway.toLowerCase()];
    if (!strategy) {
      throw new Error(`Payment gateway ${gateway} is not supported`);
    }
    return strategy;
  }

  async generatePayment(gateway, userId, amount, planId) {
    const strategy = this.getStrategy(gateway);
    return await strategy.generatePayment(userId, amount, planId);
  }
}

export const paymentContext = new PaymentContext();
