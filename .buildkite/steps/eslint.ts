/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChangeContext, CustomCommandStep } from '../utils';
import { createStep, commandStepDefaults } from '../utils';

export const eslintStep = createStep<CustomCommandStep>((ctx) => {
  return {
    ...commandStepDefaults,
    label: ':eslint: Eslint',
    key: 'eslint',
    skip: isSkippable(ctx),
    commands: ['npx ts-node .buildkite/scripts/steps/eslint.ts'],
    env: {
      ECH_CHECK_ID: 'eslint',
    },
  };
});

function isSkippable(changes: ChangeContext): boolean | string {
  const hasTSChanges = changes.files.has('**/*.ts?(x)');
  const hasLintConfigChanges = changes.files.has([
    '**/.eslintrc.js',
    '**/.eslintignore',
    '.prettierignore',
    '.prettierrc.json',
    'tsconfig.lint.json',
    'tsconfig.json',
    'package.json',
    'yarn.lock',
  ]);

  if (hasTSChanges || hasLintConfigChanges) {
    return false;
  }

  return 'No lint config nor file changes';
}
