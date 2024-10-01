import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  moduleDirectories: ["node_modules", "src"],
};

export default config;
// export default {
//   collectCoverage: true,
//   collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!**/vendor/**"],
//   coverageDirectory: "coverage",
//   testEnvironment: "jsdom",
//   transform: {
//     ".(ts|tsx)": "ts-jest",
//   },

//   coveragePathIgnorePatterns: [
//     "/node_modules/",
//     "/coverage",
//     "package.json",
//     "package-lock.json",
//     "reportWebVitals.ts",
//     "setupTests.ts",
//     "index.tsx",
//   ],
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
//   testMatch: ["<rootDir>/client/__test__/**/*.test.(ts|tsx)"],
// };
