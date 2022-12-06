// jest.config.js
const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
    jsonwebtoken: "<rootDir>/src/__mocks__/jsonwebtoken",
    "@appquality/wp-auth": "<rootDir>/src/__mocks__/@appquality-wp-auth",
  }),
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  setupFiles: ["<rootDir>/src/__mocks__/setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/__mocks__/globalSetup.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 15000,
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!<rootDir>/node_modules/",
    "!<rootDir>/src/index.ts",
    "!<rootDir>/src/config.ts",
    "!<rootDir>/src/features/db/*",
    "!<rootDir>/src/features/sqlite/*",
    "!<rootDir>/src/features/debugMessage/index.ts",
    "!<rootDir>/src/middleware/postResponseHandler.ts",
  ],
};
