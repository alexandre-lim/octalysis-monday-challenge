module.exports = () => {
  return {
    rootDir: 'src',
    globalSetup: '<rootDir>/tests/integrations/setup.js',
    globalTeardown: '<rootDir>/tests/integrations/teardown.js',
    verbose: false,
    bail: false,
    displayName: 'INTEGRATION',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/integrations/**/*.js'],
    testPathIgnorePatterns: ['<rootDir>/tests/'],
    maxWorkers: 4,
  };
};
