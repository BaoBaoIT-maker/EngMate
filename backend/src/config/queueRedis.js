import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

// Reusable connection configuration for BullMQ
export const connection = redisUrl ? new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  ...(redisUrl.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {})
}) : null;

if (connection) {
  connection.on('error', (err) => console.error('[BullMQ Redis] Connection Error:', err));
}
