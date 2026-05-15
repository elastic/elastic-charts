/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

module.exports = {
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  roots: ['<rootDir>/packages/charts/src'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/scripts/setup_tests.ts',
    '@testing-library/jest-dom',
    '<rootDir>/scripts/custom_matchers.mock.ts',
    'jest-extended/all',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/packages/charts/src/mocks',
    '<rootDir>/packages/charts/src/utils/d3-delaunay',
    '/node_modules/',
  ],
  clearMocks: true,
  // uuid v10+ ships ESM-only; Jest does not transform node_modules by default.
  transformIgnorePatterns: ['/node_modules/(?!uuid/)'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
    // Compile uuid's .js under node_modules to CJS for Jest's runtime.
    '[/\\\\]node_modules[/\\\\]uuid[/\\\\].+\\.js$': [
      'babel-jest',
      {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: { node: 'current' },
              modules: 'commonjs',
            },
          ],
        ],
      },
    ],
  },
};
