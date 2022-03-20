const defaultConfig = {
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      branch: 100, // to define the percentage of code coverage that we want
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  maxWorkers: "50%", // to prevent Jest of using 100% of our computer to run tests
  watchPathIgnorePatterns: ["node_modules"], // once that Jest doesn't work well with ESModules yet, it's interesting to set these two last rules
  transformIgnorePatterns: ["node_modules"],
};

export default {
  projects: [
    {
      ...defaultConfig,
      testEnvironment: "node",
      displayName: "backend",
      collectCoverageFrom: ["server/", "!server/index.js"],
      transformIgnorePatterns: [
        ...defaultConfig.transformIgnorePatterns,
        "public",
      ],
      testMatch: ["**/tests/**/server/**/*.test.js"],
    },
    {
      ...defaultConfig,
      testEnvironment: "jsdom",
      displayName: "frontend",
      collectCoverageFrom: ["public/"],
      transformIgnorePatterns: [
        ...defaultConfig.transformIgnorePatterns,
        "server",
      ],
      testMatch: ["**/tests/**/public/**/*.test.js"],
    },
  ],
};
