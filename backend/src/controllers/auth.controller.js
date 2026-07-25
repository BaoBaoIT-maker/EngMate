import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  validateRegisterInput,
  validateLoginInput,
  validateGoogleLoginInput,
  validateFacebookLoginInput,
  validateRefreshInput,
  validateLogoutInput,
  validateVerifyOtpInput,
  validateResendOtpInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
  validateChangePasswordInput,
} from '../validators/auth.validator.js';

// --- Helper function to set cookies ---
const setAuthCookies = (res, result) => {
  // Vì frontend ở localhost (HTTP) gọi sang backend ở ngrok (HTTPS) 
  // => Đây là Cross-Origin Request. 
  // Trình duyệt bắt buộc Cookie phải có SameSite='none' và Secure=true
  const cookieOptions = {
    httpOnly: true,
    secure: true, 
    sameSite: 'none',
  };

  if (result.accessToken) {
    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  if (result.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      path: '/api/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }
};

const sendAuthResponse = (res, result, message, statusCode = 200) => {
  setAuthCookies(res, result);

  // Không trả về token trong body response nữa để bảo mật
  const data = { ...result };
  delete data.token;
  delete data.accessToken;
  delete data.refreshToken;

  return sendSuccess(res, data, message, statusCode);
};

export const register = async (req, res) => {
  try {
    const validationError = validateRegisterInput(req.body);
    if (validationError) return sendError(res, validationError, 400);

    const { email, password, username } = req.body;
    const result = await authService.register({ email, password, username });
    
    // Đăng ký thành công trả về OTP require, không có token
    return sendSuccess(res, result, 'OTP sent to email', 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const login = async (req, res) => {
  try {
    const validationError = validateLoginInput(req.body);
    if (validationError) return sendError(res, validationError, 400);

    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    
    return sendAuthResponse(res, result, 'Login successful');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const googleLogin = async (req, res) => {
  try {
    const validationError = validateGoogleLoginInput(req.body);
    if (validationError) return sendError(res, validationError, 400);

    const { idToken } = req.body;
    const result = await authService.loginWithGoogle({ idToken });
    
    return sendAuthResponse(res, result, 'Google login successful');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const facebookLogin = async (req, res) => {
  try {
    const validationError = validateFacebookLoginInput(req.body);
    if (validationError) return sendError(res, validationError, 400);

    const { accessToken } = req.body;
    const result = await authService.loginWithFacebook({ accessToken });
    
    return sendAuthResponse(res, result, 'Facebook login successful');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const me = async (req, res) => {
  try {
    const result = await authService.getMe(req.user.id);
    return sendSuccess(res, result, 'Profile loaded');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const refresh = async (req, res) => {
  try {
    // Đọc refresh token từ cookie trước, fallback body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    const validationError = validateRefreshInput({ refreshToken });
    if (validationError) return sendError(res, validationError, 400);

    const result = await authService.refreshSession({ refreshToken });
    
    return sendAuthResponse(res, result, 'Token refreshed');
  } catch (error) {
    // Clear cookies if refresh fails
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    // Không require refresh token cứng nhắc khi logout
    if (refreshToken) {
      const validationError = validateLogoutInput({ refreshToken });
      if (validationError) return sendError(res, validationError, 400);
      await authService.logout({ refreshToken });
    }

    // Xóa cookie
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

    return sendSuccess(res, { success: true }, 'Logged out');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const validationError = validateVerifyOtpInput(req.body);
    if (validationError) return sendError(res, validationError, 400);

    const { email, otp } = req.body;
    const result = await authService.verifyEmailOtp({ email, otp });
    
    return sendAuthResponse(res, result, 'Account verified');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const resendOtp = async (req, res) => {
  try {
    const validationError = validateResendOtpInput(req.body);
    if (validationError) return sendError(res, validationError, 400);

    const { email } = req.body;
    const result = await authService.resendVerificationOtp({ email });
    return sendSuccess(res, result, 'OTP resent');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const validationError = validateForgotPasswordInput(req.body);
    if (validationError) return sendError(res, validationError, 400);

    const { email } = req.body;
    const result = await authService.forgotPassword({ email });
    return sendSuccess(res, result, result.message);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const validationError = validateResetPasswordInput(req.body);
    if (validationError) return sendError(res, validationError, 400);

    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword({ email, otp, newPassword });
    return sendSuccess(res, result, result.message);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const changePassword = async (req, res) => {
  try {
    const validationError = validateChangePasswordInput(req.body);
    if (validationError) return sendError(res, validationError, 400);

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const result = await authService.changePassword({ userId, oldPassword, newPassword });
    return sendSuccess(res, result, result.message);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};