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
    '<rootDir>/scripts/setup_enzyme.ts',
    '<rootDir>/scripts/custom_matchers.mock.ts',
    'jest-extended/all',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/packages/charts/src/mocks',
    '<rootDir>/packages/charts/src/utils/d3-delaunay',
    '/node_modules/',
  ],
  clearMocks: true,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
};
