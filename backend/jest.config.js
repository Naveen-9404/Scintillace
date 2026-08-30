export default {
  testEnvironment: "node",
  testTimeout: 60000,
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: [
    "src/controllers/**/*.js",
    "src/services/**/*.js",
    "src/middlewares/**/*.js",
  ],
  coverageDirectory: "coverage",
  testMatch: ["**/tests/**/*.test.js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // Important for ESM imports
  },
};
