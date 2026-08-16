import { Queue, Worker } from 'bullmq';
import { connection } from '../config/queueRedis.js';
import { sendVerificationOtpEmail, sendForgotPasswordOtpEmail } from '../services/email.service.js';

export const emailQueue = new Queue('EmailQueue', { connection });

// Khởi tạo worker nếu có kết nối Redis
export const emailWorker = connection ? new Worker('EmailQueue', async (job) => {
  const { type, data } = job.data;
  
  try {
    if (type === 'SEND_VERIFICATION_OTP') {
      await sendVerificationOtpEmail(data);
      console.log(`[EmailWorker] Sent verification email to ${data.email}`);
    } else if (type === 'SEND_FORGOT_PWD_OTP') {
      await sendForgotPasswordOtpEmail(data);
      console.log(`[EmailWorker] Sent forgot password email to ${data.email}`);
    }
  } catch (error) {
    console.error(`[EmailWorker] Failed to send email to ${data.email}`, error);
    throw error;
  }
}, { connection }) : null;

if (emailWorker) {
  emailWorker.on('failed', (job, err) => {
    console.error(`[EmailWorker] Job ${job.id} failed with error ${err.message}`);
  });
}
