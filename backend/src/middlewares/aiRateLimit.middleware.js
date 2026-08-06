import { cacheGetJson, cacheSetJson } from '../config/redis.js';
import prisma from '../config/prisma.js';
import { sendError } from '../utils/response.js';

export default async function aiRateLimitMiddleware(req, res, next) {
  try {
    const userId = req.user.id;
    
    // Check if user is premium to determine their rate limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } }
    });

    const isPremium = user?.subscription?.isValid && user?.subscription?.plan?.code !== 'FREE';
    
    // Free: 2 req/min, Premium: 5 req/min
    const MAX_REQUESTS = isPremium ? 5 : 2;
    const WINDOW_SECONDS = 60;
    const redisKey = `engmate:ai:ratelimit:${userId}`;

    // Graceful degradation if Redis is not available
    let rateLimitData = null;
    try {
      rateLimitData = await cacheGetJson(redisKey);
    } catch (redisError) {
      console.warn("Redis not available for rate limiting:", redisError);
      return next(); // Pass through if Redis is down
    }

    const now = Date.now();

    if (!rateLimitData) {
      // First request
      await cacheSetJson(redisKey, {
        count: 1,
        resetAt: now + WINDOW_SECONDS * 1000
      }, WINDOW_SECONDS);
      return next();
    }

    // Check if window has expired (failsafe, though TTL should handle this)
    if (now > rateLimitData.resetAt) {
      await cacheSetJson(redisKey, {
        count: 1,
        resetAt: now + WINDOW_SECONDS * 1000
      }, WINDOW_SECONDS);
      return next();
    }

    // Check if limit exceeded
    if (rateLimitData.count >= MAX_REQUESTS) {
      const retryAfterSeconds = Math.ceil((rateLimitData.resetAt - now) / 1000);
      return res.status(429).json({
        success: false,
        message: 'RATE_LIMITED',
        retryAfter: retryAfterSeconds
      });
    }

    // Increment count
    await cacheSetJson(redisKey, {
      count: rateLimitData.count + 1,
      resetAt: rateLimitData.resetAt
    }, Math.ceil((rateLimitData.resetAt - now) / 1000));

    next();
  } catch (error) {
    console.error("Rate limit error:", error);
    // Graceful degradation on error
    next();
  }
}
