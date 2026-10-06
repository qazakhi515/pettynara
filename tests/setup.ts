import mongoose from "mongoose";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL as string);
  // Unique indexes (member nick and phone, product name, likes) are part of
  // the behaviour under test, so build them before the first request.
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.syncIndexes()),
  );
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(
    collections
      .filter((c) => c.collectionName !== "sessions")
      .map((c) => c.deleteMany({})),
  );
});

afterAll(async () => {
  await mongoose.disconnect();
});
