import axios from 'axios';
import {
  findUserByEmail,
  findUserById,
  findUserByProvider,
  createAuthUser,
  updateAuthUser,
  markUserVerified,
  createUserProfile,
  upsertUserProfile,
  createUserSetting,
  upsertUserSetting,
  createUserSkill,
  upsertUserSkill,
  updatePassword,
  upsertLearningPath,
} from '../repository/auth.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { cacheDelete, cacheGetJson, cacheSetJson } from '../config/redis.js';
import { generateOtpCode, hashOtpCode, verifyOtpCode } from '../utils/otp.js';
import { enqueueEmail } from '../queues/email.queue.js';

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider,
    isVerified: user.isVerified,
    verifiedAt: user.verifiedAt,
    profile: user.profile || null,
    setting: user.setting || null,
    skill: user.skill || null,
    subscription: user.subscription || null,
    learningPaths: user.learningPaths || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const refreshTokenKey = (jti) => `engmate:auth:refresh:${jti}`;
const userCacheKey = (userId) => `engmate:user:me:${userId}`;
const otpKey = (email) => `engmate:auth:otp:${String(email).toLowerCase()}`;
const forgotPasswordOtpKey = (email) => `engmate:auth:forgot_pwd_otp:${String(email).toLowerCase()}`;
const OTP_TTL_SECONDS = 60 * 10;

const buildAuthPayload = async (user) => {
  const token = signAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  const refreshTokenPayload = signRefreshToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  await cacheSetJson(refreshTokenKey(refreshTokenPayload.jti), {
    userId: user.id,
    role: user.role,
    email: user.email,
  }, 60 * 60 * 24 * 30);

  return {
    token,
    accessToken: token,
    refreshToken: refreshTokenPayload.token,
    user: sanitizeUser(user),
  };
};

const storeAndSendVerificationOtp = async ({ user, email, username }) => {
  const otpCode = generateOtpCode();

  await cacheSetJson(otpKey(email), {
    userId: user.id,
    email,
    username,
    otpHash: hashOtpCode(otpCode),
  }, OTP_TTL_SECONDS);

  // Đưa vào Queue để gửi email ngầm (hoặc chạy đồng bộ nếu Redis lỗi)
  await enqueueEmail('SEND_VERIFICATION_OTP', { email, username, otpCode });
};

const createDefaultRelations = async (userId, defaults = {}) => {
  const user = await findUserById(userId);

  if (!user?.profile) {
    await createUserProfile({
      userId,
      username: defaults.username || 'User',
      avatarUrl: defaults.avatarUrl || null,
      bio: defaults.bio || null,
    });
  } else if (defaults.avatarUrl && !user.profile.avatarUrl) {
    await updateUserProfile(userId, { avatarUrl: defaults.avatarUrl });
  }

  if (!user?.setting) {
    await createUserSetting({
      userId,
      theme: 'LIGHT',
      receiveEmails: true,
      dailyWordGoal: 15,
      onboardingDone: false,
    });
  }

  if (!user?.skill) {
    await createUserSkill({
      userId,
      currentLevel: 'A1',
      vocabularyScore: 0,
      grammarScore: 0,
      speakingScore: 0,
    });
  }
};

const createVerifiedAccountRelations = async (userId, username, avatarUrl = null) => {
  await createUserProfile({
    userId,
    username,
    avatarUrl,
    bio: null,
  });

  await createUserSetting({
    userId,
    theme: 'LIGHT',
    receiveEmails: true,
    dailyWordGoal: 15,
    onboardingDone: false,
  });

  await createUserSkill({
    userId,
    currentLevel: 'A1',
    vocabularyScore: 0,
    grammarScore: 0,
    speakingScore: 0,
  });
};

const prepareLocalAuthUser = async ({ email, password, username }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error('Email already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await createAuthUser({
    email: normalizedEmail,
    passwordHash,
    role: 'USER',
    isVerified: false,
    verifiedAt: null,
    provider: 'LOCAL',
  });

  await storeAndSendVerificationOtp({
    user,
    email: normalizedEmail,
    username: username || normalizedEmail.split('@')[0],
  });

  return {
    email: normalizedEmail,
    verificationRequired: true,
    message: 'OTP has been sent to your email',
  };
};

const syncSocialUser = async ({ provider, providerId, email, username, avatarUrl }) => {
  const providerUser = await findUserByProvider(provider, providerId);
  const emailUser = email ? await findUserByEmail(email) : null;
  let user = providerUser || emailUser;

  if (user) {
    if (user.provider !== provider || user.providerId !== providerId) {
      user = await updateAuthUser(user.id, {
        provider,
        providerId,
        isVerified: true,
        verifiedAt: user.isVerified ? user.verifiedAt : new Date(),
      });
    }

    await createDefaultRelations(user.id, {
      username: username || user.profile?.username || email?.split('@')[0] || 'User',
      avatarUrl: avatarUrl || user.profile?.avatarUrl || null,
    });

    return buildAuthPayload(await findUserById(user.id));
  }

  user = await createAuthUser({
    email,
    passwordHash: null,
    role: 'USER',
    isVerified: true,
    verifiedAt: new Date(),
    provider,
    providerId,
  });

  await createDefaultRelations(user.id, {
    username: username || email.split('@')[0],
    avatarUrl: avatarUrl || null,
  });

  return buildAuthPayload(await findUserById(user.id));
};

const verifyGoogleToken = async (token) => {
  try {
    let url = `https://www.googleapis.com/oauth2/v3/userinfo`;
    let headers = { Authorization: `Bearer ${token}` };
    if (token.split('.').length === 3) {
      url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
      headers = {};
    }
    const res = await axios.get(url, { headers });
    const payload = res.data;
    
    if (!payload.email) {
      const error = new Error('Google account does not expose an email');
      error.statusCode = 400;
      throw error;
    }
    
    return {
      providerId: payload.sub,
      email: payload.email,
      username: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture,
    };
  } catch (error) {
    const err = new Error('Invalid Google token');
    err.statusCode = 401;
    throw err;
  }
};

const verifyFacebookToken = async (accessToken) => {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    const error = new Error('Facebook OAuth is not configured');
    error.statusCode = 500;
    throw error;
  }

  const appAccessToken = `${appId}|${appSecret}`;

  const debugResponse = await axios.get('https://graph.facebook.com/debug_token', {
    params: {
      input_token: accessToken,
      access_token: appAccessToken,
    },
  });

  const debugData = debugResponse.data?.data;

  if (!debugData?.is_valid || String(debugData.app_id) !== String(appId)) {
    const error = new Error('Invalid Facebook token');
    error.statusCode = 401;
    throw error;
  }

  const profileResponse = await axios.get('https://graph.facebook.com/me', {
    params: {
      fields: 'id,name,email,picture.type(large)',
      access_token: accessToken,
    },
  });

  const profile = profileResponse.data;

  if (!profile.email) {
    const error = new Error('Facebook account does not expose an email');
    error.statusCode = 400;
    throw error;
  }

  return {
    providerId: profile.id,
    email: profile.email,
    username: profile.name,
    avatarUrl: profile.picture?.data?.url || null,
  };
};

export const register = async ({ email, password, username }) => {
  return prepareLocalAuthUser({ email, password, username });
};

export const login = async ({ email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || !user.passwordHash) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error('Account is not verified. Please verify your email first');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return buildAuthPayload(await findUserById(user.id));
};

export const verifyEmailOtp = async ({ email, otp }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const pendingOtp = await cacheGetJson(otpKey(normalizedEmail));

  if (!pendingOtp) {
    const user = await findUserByEmail(normalizedEmail);
    if (user && user.isVerified) {
      const userWithRelations = await findUserById(user.id);
      return buildAuthPayload(userWithRelations);
    }
    const error = new Error('OTP is expired or missing');
    error.statusCode = 400;
    throw error;
  }

  if (!verifyOtpCode(otp, pendingOtp.otpHash)) {
    const error = new Error('OTP is invalid');
    error.statusCode = 400;
    throw error;
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const userWithRelations = await findUserById(user.id);

  if (user.isVerified) {
    await cacheDelete(otpKey(normalizedEmail));
    return buildAuthPayload(userWithRelations);
  }

  await markUserVerified(user.id);
  await cacheDelete(otpKey(normalizedEmail));

  await createVerifiedAccountRelations(
    user.id,
    pendingOtp.username || normalizedEmail.split('@')[0],
  );

  return buildAuthPayload(await findUserById(user.id));
};

export const resendVerificationOtp = async ({ email }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error('Account is already verified');
    error.statusCode = 400;
    throw error;
  }

  const userWithRelations = await findUserById(user.id);

  await storeAndSendVerificationOtp({
    user,
    email: normalizedEmail,
    username: userWithRelations?.profile?.username || normalizedEmail.split('@')[0],
  });

  return {
    email: normalizedEmail,
    verificationRequired: true,
    message: 'OTP has been resent',
  };
};

export const getMe = async (userId) => {
  const cachedUser = await cacheGetJson(userCacheKey(userId));

  if (cachedUser) {
    return cachedUser;
  }

  const user = await findUserById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const payload = sanitizeUser(user);
  await cacheSetJson(userCacheKey(userId), payload, 300);

  return payload;
};

export const loginWithGoogle = async ({ idToken }) => {
  if (!idToken) {
    const error = new Error('Google idToken is required');
    error.statusCode = 400;
    throw error;
  }

  const profile = await verifyGoogleToken(idToken);
  return syncSocialUser({
    provider: 'GOOGLE',
    providerId: profile.providerId,
    email: profile.email,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
  });
};

export const loginWithFacebook = async ({ accessToken }) => {
  if (!accessToken) {
    const error = new Error('Facebook accessToken is required');
    error.statusCode = 400;
    throw error;
  }

  const profile = await verifyFacebookToken(accessToken);
  return syncSocialUser({
    provider: 'FACEBOOK',
    providerId: profile.providerId,
    email: profile.email,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
  });
};

export const refreshSession = async ({ refreshToken }) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const tokenJti = decoded.jti;

  if (!tokenJti) {
    const error = new Error('Invalid refresh token payload');
    error.statusCode = 401;
    throw error;
  }

  const storedToken = await cacheGetJson(refreshTokenKey(tokenJti));

  if (!storedToken) {
    const error = new Error('Refresh token has been revoked');
    error.statusCode = 401;
    throw error;
  }

  const user = await findUserById(decoded.userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  await cacheDelete(refreshTokenKey(tokenJti));

  return buildAuthPayload(user);
};

export const logout = async ({ refreshToken }) => {
  if (!refreshToken) {
    return { success: true };
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded?.jti) {
      await cacheDelete(refreshTokenKey(decoded.jti));
    }
  } catch {
    // Logout should be idempotent even when the refresh token is already expired.
  }

  return { success: true };
};

export const forgotPassword = async ({ email }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    const error = new Error('Tài khoản không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (user.provider !== 'LOCAL') {
    const error = new Error('Tài khoản đăng nhập qua mạng xã hội không hỗ trợ tính năng này. Vui lòng đăng nhập bằng Google hoặc Facebook.');
    error.statusCode = 400;
    throw error;
  }

  const userWithRelations = await findUserById(user.id);
  const username = userWithRelations?.profile?.username || normalizedEmail.split('@')[0];
  const otpCode = generateOtpCode();

  await cacheSetJson(forgotPasswordOtpKey(normalizedEmail), {
    userId: user.id,
    email: normalizedEmail,
    otpHash: hashOtpCode(otpCode),
  }, OTP_TTL_SECONDS);

  await enqueueEmail('SEND_FORGOT_PWD_OTP', {
    email,
    username: user.profile?.username,
    otpCode,
  });

  return {
    success: true,
    message: 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn',
  };
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const pendingOtp = await cacheGetJson(forgotPasswordOtpKey(normalizedEmail));

  if (!pendingOtp) {
    const error = new Error('OTP đã hết hạn hoặc không hợp lệ');
    error.statusCode = 400;
    throw error;
  }

  if (!verifyOtpCode(otp, pendingOtp.otpHash)) {
    const error = new Error('OTP không chính xác');
    error.statusCode = 400;
    throw error;
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user || user.id !== pendingOtp.userId) {
    const error = new Error('Dữ liệu không hợp lệ');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await hashPassword(newPassword);
  await updatePassword(user.id, passwordHash);
  await cacheDelete(forgotPasswordOtpKey(normalizedEmail));

  return {
    success: true,
    message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.',
  };
};

export const changePassword = async ({ userId, oldPassword, newPassword }) => {
  const user = await findUserById(userId);

  if (!user) {
    const error = new Error('Tài khoản không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (user.provider !== 'LOCAL') {
    const error = new Error('Tài khoản đăng nhập qua mạng xã hội không hỗ trợ tính năng này.');
    error.statusCode = 400;
    throw error;
  }

  const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Mật khẩu hiện tại không chính xác');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await hashPassword(newPassword);
  await updatePassword(user.id, passwordHash);

  return {
    success: true,
    message: 'Đổi mật khẩu thành công',
  };
};