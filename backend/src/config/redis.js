const { createClient } = require('redis');

let redisClient = null;
let isRedisConnected = false;

const redisUrl = process.env.REDIS_URL;

// Simple in-memory fallback cache
const memoryCache = new Map();
const memoryCacheExpirations = new Map();

if (redisUrl) {
  console.log('[Redis Config] Live Redis URL found. Initializing Redis client...');
  redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 5) {
          console.warn('[Redis Config] Max reconnection attempts reached. Disabling Redis...');
          isRedisConnected = false;
          return new Error('Redis connection failed');
        }
        return Math.min(retries * 500, 2000);
      }
    }
  });

  redisClient.on('connect', () => {
    console.log('[Redis Config] Connected to Redis server.');
    isRedisConnected = true;
  });

  redisClient.on('error', (err) => {
    console.error('[Redis Config] Redis Client Error:', err);
    isRedisConnected = false;
  });

  redisClient.connect().catch((err) => {
    console.error('[Redis Config] Failed to connect to Redis on startup:', err);
  });
} else {
  console.log('[Redis Config] No REDIS_URL found. Defaulting to in-memory fallback.');
}

const getCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      return await redisClient.get(key);
    } catch (err) {
      console.error('[Redis Cache] Get error:', err);
    }
  }
  
  // Memory fallback logic
  const cachedVal = memoryCache.get(key);
  if (cachedVal !== undefined) {
    const expiration = memoryCacheExpirations.get(key);
    if (expiration && Date.now() > expiration) {
      // Evict expired item
      memoryCache.delete(key);
      memoryCacheExpirations.delete(key);
      return null;
    }
    return cachedVal;
  }
  
  return null;
};

const setCache = async (key, value, expirySeconds) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, value, {
        EX: expirySeconds
      });
      return;
    } catch (err) {
      console.error('[Redis Cache] Set error:', err);
    }
  }

  // Memory fallback logic
  memoryCache.set(key, value);
  if (expirySeconds) {
    memoryCacheExpirations.set(key, Date.now() + expirySeconds * 1000);
  }
};

module.exports = {
  getCache,
  setCache,
  isRedisConnected: () => isRedisConnected
};
