/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  // Starts an in-memory MongoDB and points MONGO_URL at it, so tests never
  // touch the database configured in .env.
  globalSetup: "<rootDir>/tests/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/globalTeardown.ts",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  // All test files share one database and clear it between tests.
  maxWorkers: 1,
  testTimeout: 20000,
  // The admin session store in app.ts opens its own MongoDB client that is
  // never closed, which would keep Jest waiting after the last test.
  forceExit: true,
};
