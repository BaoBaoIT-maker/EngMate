export class PaymentStrategy {
  /**
   * Sinh ra giao dịch thanh toán (ví dụ: tạo link QR hoặc link chuyển hướng)
   * @param {number} userId 
   * @param {number} amount 
   * @param {number|string} planId 
   * @returns {Promise<Object>}
   */
  async generatePayment(userId, amount, planId) {
    throw new Error('generatePayment method must be implemented');
  }
}
