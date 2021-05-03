module.exports = () => {
  return {
    rootDir: '.',
    globalSetup: '<rootDir>/src/tests/integrations/setup.js',
    globalTeardown: '<rootDir>/src/tests/integrations/teardown.js',
    verbose: false,
    bail: false,
    displayName: 'INTEGRATION',
    preset: '@shelf/jest-mongodb',
    testMatch: ['**/__tests__/integrations/**/*.js'],
    testPathIgnorePatterns: ['<rootDir>/src/tests/'],
    watchPathIgnorePatterns: ['globalConfig', 'data'],
    maxWorkers: 4,
  };
};
