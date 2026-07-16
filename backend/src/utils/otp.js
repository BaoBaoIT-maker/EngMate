import { createHash, randomInt } from 'node:crypto';

export const generateOtpCode = () => String(randomInt(100000, 1000000));

export const hashOtpCode = (otpCode) => {
  return createHash('sha256').update(String(otpCode)).digest('hex');
};

export const verifyOtpCode = (otpCode, hashedOtp) => {
  return hashOtpCode(otpCode) === hashedOtp;
};
