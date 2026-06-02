import rateLimit from 'express-rate-limit';

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MIN = 15;

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs per IP
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
