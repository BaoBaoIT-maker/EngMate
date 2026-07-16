import { mailerTransport } from '../config/mailer.js';

const fromAddress = process.env.EMAIL_USER;

export const sendVerificationOtpEmail = async ({ email, username, otpCode }) => {
  const displayName = username || email;

  await mailerTransport.sendMail({
    from: fromAddress,
    to: email,
    subject: 'EngMate - Xác minh tài khoản',
    text: `Xin chào ${displayName},\n\nMã OTP xác minh tài khoản của bạn là: ${otpCode}\nMã này có hiệu lực trong 10 phút.\n\nNếu bạn không yêu cầu mã này, hãy bỏ qua email này.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>EngMate - Xác minh tài khoản</h2>
        <p>Xin chào <strong>${displayName}</strong>,</p>
        <p>Mã OTP xác minh tài khoản của bạn là:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 12px 16px; background: #f3f4f6; display: inline-block; border-radius: 8px;">
          ${otpCode}
        </div>
        <p>Mã này có hiệu lực trong 10 phút.</p>
        <p>Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
      </div>
    `,
  });
};

export const sendForgotPasswordOtpEmail = async ({ email, username, otpCode }) => {
  const displayName = username || email;

  await mailerTransport.sendMail({
    from: fromAddress,
    to: email,
    subject: 'EngMate - Đặt lại mật khẩu',
    text: `Xin chào ${displayName},\n\nMã OTP đặt lại mật khẩu của bạn là: ${otpCode}\nMã này có hiệu lực trong 10 phút.\n\nNếu bạn không yêu cầu mã này, hãy bỏ qua email này.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>EngMate - Đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${displayName}</strong>,</p>
        <p>Mã OTP đặt lại mật khẩu của bạn là:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 12px 16px; background: #f3f4f6; display: inline-block; border-radius: 8px;">
          ${otpCode}
        </div>
        <p>Mã này có hiệu lực trong 10 phút.</p>
        <p>Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
      </div>
    `,
  });
};
