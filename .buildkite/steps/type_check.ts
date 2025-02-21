/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChangeContext, CustomCommandStep } from '../utils';
import { createStep, commandStepDefaults } from '../utils';

export const typeCheckStep = createStep<CustomCommandStep>((ctx) => {
  return {
    ...commandStepDefaults,
    label: ':typescript: Types',
    key: 'types',
    skip: isSkippable(ctx),
    commands: ['npx ts-node .buildkite/scripts/steps/type_check.ts'],
    env: {
      ECH_CHECK_ID: 'types',
    },
  };
});

function isSkippable(changes: ChangeContext): boolean | string {
  const hasTSChanges = changes.files.has('**/*.ts?(x)');
  const hasConfigChanges = changes.files.has(['yarn.lock', 'package.json', 'tsconfig.json']);

  if (hasTSChanges || hasConfigChanges) {
    return false;
  }

  return 'No typescript config nor file changes';
}
