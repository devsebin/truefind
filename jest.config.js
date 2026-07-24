module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  roots: ["<rootDir>/src/tests"],

  testMatch: ["**/?(*.)+(spec|test).ts"],

  setupFilesAfterEnv: ["<rootDir>/src/tests/setup/jest.setup.ts"],

  // Prevent MongoDB transaction lock contention across multiple workers
  maxWorkers: 1,

  // Allow MongoMemoryReplSet shutdown to finish reliably
  testTimeout: 30000,


  transform: {
    "^.+\\.(ts|js)$": "ts-jest",
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  transformIgnorePatterns: [
    "/node_modules/(?!(@faker-js/faker)/)",
  ],
};
