/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const jestPuppeteerDocker = require('jest-puppeteer-docker/jest-preset');
const jestPuppeteer = require('jest-puppeteer/jest-preset');
const tsPreset = require('ts-jest/jest-preset');

const { debug } = require('./config');

const mergedConfig = {
  ...(debug ? jestPuppeteer : jestPuppeteerDocker),
  ...tsPreset,
};

module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
    /*
     * The window and HTMLElement globals are required to use @elastic/eui with VRT
     *
     * The jest-puppeteer-docker env extends a node test environment and not jsdom test environment.
     * Some EUI components that are included in the bundle, but not used, require the jsdom setup.
     * To bypass these errors we are just mocking both as empty objects.
     */
    window: {},
    HTMLElement: {},
  },
  reporters: ['default', 'jest-image-snapshot/src/outdated-snapshot-reporter.js'],
  ...mergedConfig,
  setupFilesAfterEnv: ['<rootDir>/jest_env_setup.ts', 'jest-extended', ...(mergedConfig.setupFilesAfterEnv ?? [])],
};
