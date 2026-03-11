export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupFileAfterEnv.js'],
  globalSetup: '<rootDir>/src/test/globalSetup.js',
  globalTeardown: '<rootDir>/src/test/globalTeardown.js',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js']
};