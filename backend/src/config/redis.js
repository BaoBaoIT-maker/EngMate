import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

let redisClient;
let redisConnectPromise;

const getClient = async () => {
  if (!redisUrl) {
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (redisConnectPromise) {
    return redisConnectPromise;
  }

  redisClient = createClient({ url: redisUrl });
  redisClient.on('error', () => {
    // Redis is optional for the first auth/profile flows.
  });

  redisConnectPromise = redisClient.connect()
    .then(() => redisClient)
    .catch((error) => {
      redisClient = undefined;
      throw error;
    })
    .finally(() => {
      redisConnectPromise = undefined;
    });

  return redisConnectPromise;
};

export const cacheGetJson = async (key) => {
  try {
    const client = await getClient();

    if (!client) {
      return null;
    }

    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const cacheSetJson = async (key, value, ttlSeconds = 300) => {
  try {
    const client = await getClient();

    if (!client) {
      return false;
    }

    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch {
    return false;
  }
};

export const cacheDelete = async (key) => {
  try {
    const client = await getClient();

    if (!client) {
      return false;
    }

    await client.del(key);
    return true;
  } catch {
    return false;
  }
};