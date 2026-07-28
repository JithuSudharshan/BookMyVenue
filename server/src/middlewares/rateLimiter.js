import AppError from '../utils/AppError.js';

const rateLimitCache = new Map();

/**
 * Basic in-memory rate limiter for public endpoints (like pricing summary)
 * For production with multiple instances, use Redis, but this suffices for MVP.
 */
export const pricingRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20; // 20 requests per minute

  if (!rateLimitCache.has(ip)) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const record = rateLimitCache.get(ip);

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    rateLimitCache.set(ip, record);
    return next();
  }

  if (record.count >= maxRequests) {
    return next(new AppError('Too many pricing requests from this IP, please try again after a minute', 429));
  }

  record.count += 1;
  rateLimitCache.set(ip, record);
  next();
};
