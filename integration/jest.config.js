const tsPreset = require('ts-jest/jest-preset');
const jestPuppeteerDocker = require('jest-puppeteer-docker/jest-preset');

module.exports = Object.assign(tsPreset, jestPuppeteerDocker, {
  setupFilesAfterEnv: ['<rootDir>/jest-env-setup.ts'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.json',
    },
  },
});
