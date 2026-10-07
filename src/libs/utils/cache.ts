import { getRedis } from "../redis";
import { ProductInquiry } from "../types/product";

/**
 * Cache-aside for public, read-heavy responses: read from Redis, and on a miss
 * load from MongoDB and store the result with a TTL. Without Redis, or when a
 * Redis command fails, it simply loads from MongoDB.
 */
export const cached = async <T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> => {
  const redis = getRedis();
  if (!redis) return load();

  try {
    const hit = await redis.get(key);
    if (hit !== null) return JSON.parse(hit) as T;
  } catch (err) {
    console.log("Error, cache read:", err);
  }

  const value = await load();
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.log("Error, cache write:", err);
  }
  return value;
};

export const CACHE_TTL_SECONDS = 60;
export const TOP_USERS_CACHE_KEY = "cache:top-users";

/**
 * Product lists are cached per query, so there are many keys. Instead of
 * finding and deleting them all when the admin edits a product, every key
 * carries a version number and an edit bumps it. Old keys are never read
 * again and expire with their TTL.
 */
const PRODUCTS_VERSION_KEY = "cache:products:version";

export const cachedProductList = async <T>(
  inquiry: ProductInquiry,
  load: () => Promise<T>,
): Promise<T> => {
  const redis = getRedis();
  if (!redis) return load();

  let version: string;
  try {
    version = (await redis.get(PRODUCTS_VERSION_KEY)) ?? "0";
  } catch (err) {
    console.log("Error, cache read:", err);
    return load();
  }

  const query = JSON.stringify([
    inquiry.productCollection ?? null,
    inquiry.search ?? null,
    inquiry.order,
    inquiry.page,
    inquiry.limit,
  ]);
  return cached(`cache:products:v${version}:${query}`, CACHE_TTL_SECONDS, load);
};

/** Called after the admin creates or changes a product. */
export const invalidateProductLists = async (): Promise<void> => {
  try {
    await getRedis()?.incr(PRODUCTS_VERSION_KEY);
  } catch (err) {
    // The lists show the old data until their TTL runs out.
    console.log("Error, cache invalidate:", err);
  }
};
