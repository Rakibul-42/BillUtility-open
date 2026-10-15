import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

const message = (action) => ({
  message: `Too many ${action} attempts. Please wait a moment and try again.`,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('sign-in'),
  skipSuccessfulRequests: false,
});

export const insightLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('insight generation'),
  keyGenerator: (req) => req.userId || ipKeyGenerator(req.ip),
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('requests'),
  skip: (req) => req.path === '/',
});

export const avatarLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many upload attempts. Please try again later.' },
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('search'),
});
