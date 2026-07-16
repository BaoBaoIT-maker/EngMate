const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : value);

const validateEmail = (value) => {
  const normalized = normalizeString(value);

  if (!isNonEmptyString(normalized)) {
    return 'Email is required';
  }

  if (!emailPattern.test(normalized)) {
    return 'Email format is invalid';
  }

  return null;
};

const validatePassword = (value) => {
  if (!isNonEmptyString(value)) {
    return 'Password is required';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Password must contain at least one letter and one number';
  }

  return null;
};

const validateLoginPassword = (value) => {
  if (!isNonEmptyString(value)) {
    return 'Password is required';
  }

  return null;
};

const validateUsername = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const normalized = normalizeString(value);

  if (!isNonEmptyString(normalized)) {
    return 'Username must be a non-empty string';
  }

  if (normalized.length < 3 || normalized.length > 50) {
    return 'Username must be between 3 and 50 characters';
  }

  if (!/^[\p{L}\p{N} ._\-]+$/u.test(normalized)) {
    return 'Username contains invalid characters';
  }

  return null;
};

const validateTokenField = (value, fieldName) => {
  if (!isNonEmptyString(value)) {
    return `${fieldName} is required`;
  }

  if (value.trim().length < 20) {
    return `${fieldName} looks invalid`;
  }

  return null;
};

const validateOtpCode = (value) => {
  if (!isNonEmptyString(value)) {
    return 'OTP is required';
  }

  if (!/^\d{6}$/.test(value.trim())) {
    return 'OTP must be a 6-digit code';
  }

  return null;
};

const extractAuthError = (...errors) => errors.find(Boolean);

export const validateRegisterInput = (payload = {}) => {
  const email = normalizeString(payload.email);
  const password = payload.password;
  const username = payload.username;

  return extractAuthError(
    validateEmail(email),
    validatePassword(password),
    validateUsername(username),
  );
};

export const validateLoginInput = (payload = {}) => {
  const email = normalizeString(payload.email);
  const password = payload.password;

  return extractAuthError(
    validateEmail(email),
    validateLoginPassword(password),
  );
};

export const validateGoogleLoginInput = (payload = {}) => {
  return validateTokenField(payload.idToken, 'Google idToken');
};

export const validateFacebookLoginInput = (payload = {}) => {
  return validateTokenField(payload.accessToken, 'Facebook accessToken');
};

export const validateRefreshInput = (payload = {}) => {
  return validateTokenField(payload.refreshToken, 'Refresh token');
};

export const validateLogoutInput = (payload = {}) => {
  if (payload.refreshToken === undefined || payload.refreshToken === null || payload.refreshToken === '') {
    return null;
  }

  return validateTokenField(payload.refreshToken, 'Refresh token');
};

export const validateVerifyOtpInput = (payload = {}) => {
  const email = normalizeString(payload.email);
  const otp = payload.otp;

  return extractAuthError(
    validateEmail(email),
    validateOtpCode(otp),
  );
};

export const validateResendOtpInput = (payload = {}) => {
  const email = normalizeString(payload.email);

  return validateEmail(email);
};

export const validateForgotPasswordInput = (payload = {}) => {
  const email = normalizeString(payload.email);
  return validateEmail(email);
};

export const validateResetPasswordInput = (payload = {}) => {
  const email = normalizeString(payload.email);
  const otp = payload.otp;
  const newPassword = payload.newPassword;

  return extractAuthError(
    validateEmail(email),
    validateOtpCode(otp),
    validatePassword(newPassword),
  );
};

export const validateChangePasswordInput = (payload = {}) => {
  const oldPassword = payload.oldPassword;
  const newPassword = payload.newPassword;

  return extractAuthError(
    validateLoginPassword(oldPassword),
    validatePassword(newPassword),
  );
};