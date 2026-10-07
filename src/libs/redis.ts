import Redis from "ioredis";

/**
 * Optional Redis connection, used for rate limiting, caching and admin
 * sessions. Without REDIS_URL the app runs without it: rate limits are kept
 * in memory, nothing is cached and sessions live in memory.
 *
 * Commands fail fast instead of queueing while Redis is unreachable, so a
 * Redis outage makes the cache fall back to MongoDB rather than hanging
 * requests.
 */

let client: Redis | null | undefined;

// Read lazily: env is loaded by dotenv in server.ts, not at import time here.
export const getRedis = (): Redis | null => {
  if (client !== undefined) return client;

  const url = process.env.REDIS_URL;
  if (!url) return (client = null);

  client = new Redis(url, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  });
  client.on("error", (err) => console.log("Error, redis:", err.message));
  return client;
};

/** Resolves once Redis is connected, or right away when Redis is not used. */
export const waitForRedis = async (timeoutMs = 5000): Promise<void> => {
  const redis = getRedis();
  if (!redis || redis.status === "ready") return;

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Redis did not become ready in time")),
      timeoutMs,
    );
    redis.once("ready", () => {
      clearTimeout(timer);
      resolve();
    });
  });
};

export const closeRedis = async (): Promise<void> => {
  if (client) await client.quit();
  client = undefined;
};
