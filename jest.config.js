module.exports = {
  testEnvironment: 'jest-environment-node',
  collectCoverageFrom: ['**/src/**/*.js'],
  testPathIgnorePatterns: ['<rootDir>/src/tests/'],
  // coverageThreshold: {
  //   global: {
  //     statements: 50,
  //     branches: 50,
  //     functions: 50,
  //     lines: 50,
  //   },
  // },
};
