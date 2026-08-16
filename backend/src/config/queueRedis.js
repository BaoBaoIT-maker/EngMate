import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

// Reusable connection configuration for BullMQ
export const connection = redisUrl ? new Redis(redisUrl, {
  maxRetriesPerRequest: null,
}) : null;
