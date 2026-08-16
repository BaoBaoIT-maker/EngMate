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

// Wrapper to safely enqueue or fallback to synchronous execution if Redis is down
export const enqueueEmail = async (type, data) => {
  if (connection && connection.status === 'ready') {
    await emailQueue.add('sendOtp', { type, data });
  } else {
    console.warn(`[EmailQueue] Redis not ready (status: ${connection?.status || 'null'}). Falling back to sync email sending.`);
    if (type === 'SEND_VERIFICATION_OTP') {
      await sendVerificationOtpEmail(data);
    } else if (type === 'SEND_FORGOT_PWD_OTP') {
      await sendForgotPasswordOtpEmail(data);
    }
  }
};
