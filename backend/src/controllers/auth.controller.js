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

export const register = async (req, res) => {
  try {
    const validationError = validateRegisterInput(req.body);

    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const { email, password, username } = req.body;

    const result = await authService.register({ email, password, username });
    return sendSuccess(res, result, 'OTP sent to email', 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const login = async (req, res) => {
  try {
    const validationError = validateLoginInput(req.body);

    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const { email, password } = req.body;

    const result = await authService.login({ email, password });
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const googleLogin = async (req, res) => {
  try {
    const validationError = validateGoogleLoginInput(req.body);

    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const { idToken } = req.body;

    const result = await authService.loginWithGoogle({ idToken });
    return sendSuccess(res, result, 'Google login successful');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const facebookLogin = async (req, res) => {
  try {
    const validationError = validateFacebookLoginInput(req.body);

    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const { accessToken } = req.body;

    const result = await authService.loginWithFacebook({ accessToken });
    return sendSuccess(res, result, 'Facebook login successful');
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
    const validationError = validateRefreshInput(req.body);

    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const { refreshToken } = req.body;

    const result = await authService.refreshSession({ refreshToken });
    return sendSuccess(res, result, 'Token refreshed');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const validationError = validateLogoutInput(req.body);

    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const result = await authService.logout({ refreshToken });
    return sendSuccess(res, result, 'Logged out');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const validationError = validateVerifyOtpInput(req.body);

    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const { email, otp } = req.body;
    const result = await authService.verifyEmailOtp({ email, otp });
    return sendSuccess(res, result, 'Account verified');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const resendOtp = async (req, res) => {
  try {
    const validationError = validateResendOtpInput(req.body);

    if (validationError) {
      return sendError(res, validationError, 400);
    }

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

    if (validationError) {
      return sendError(res, validationError, 400);
    }

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

    if (validationError) {
      return sendError(res, validationError, 400);
    }

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

    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const result = await authService.changePassword({ userId, oldPassword, newPassword });
    return sendSuccess(res, result, result.message);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};