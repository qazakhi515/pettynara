import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create({
    binary: { version: "6.0.14" },
  });
  (globalThis as any).__MONGOD__ = mongod;

  // Test workers inherit these. Real secrets and AWS settings are never needed.
  process.env.MONGO_URL = mongod.getUri("pettynara-test");
  process.env.SECRET_TOKEN = "test-secret-token";
  process.env.SESSION_SECRET = "test-session-secret";
  delete process.env.AWS_REGION;
  delete process.env.AWS_S3_BUCKET;
}
