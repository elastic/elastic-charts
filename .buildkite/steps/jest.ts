/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChangeContext, createStep, CustomCommandStep, commandStepDefaults } from '../utils';

export const jestStep = createStep<CustomCommandStep>((ctx) => {
  return {
    ...commandStepDefaults,
    label: ':jest: Jest',
    key: 'jest',
    skip: isSkippable(ctx),
    artifact_paths: ['coverage/**/*'],
    commands: ['npx ts-node .buildkite/scripts/steps/jest.ts'],
    env: {
      ECH_GH_STATUS_CONTEXT: 'Jest',
    },
  };
});

function isSkippable(changes: ChangeContext) {
  const hasTSChanges = changes.files.has('packages/charts/src/**/*.ts?(x)');
  const hasJestConfigChanges = changes.files.has([
    'jest.config.js',
    'jest.tz.config.js',
    'tsconfig.jest.json',
    'tsconfig.json',
    'packages/charts/src/tsconfig.json',
    'package.json',
    'packages/charts/package.json',
  ]);

  if (hasTSChanges || hasJestConfigChanges) {
    return false;
  }
  return 'No jest config nor file changes';
}
