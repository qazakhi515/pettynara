import mongoose from "mongoose";
import { closeRedis, getRedis, waitForRedis } from "../src/libs/redis";
import { resetRateLimiters } from "../src/libs/utils/rateLimit";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL as string);
  // Unique indexes (member nick and phone, product name, likes) are part of
  // the behaviour under test, so build them before the first request.
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.syncIndexes()),
  );
  // With REDIS_URL set (CI, or a local Redis) the same tests run on Redis.
  await waitForRedis();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
  // Each test starts with empty caches and rate-limit counters.
  await getRedis()?.flushdb();
  resetRateLimiters();
  jest.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await closeRedis();
});
