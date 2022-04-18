/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChangeContext, createStep, CustomCommandStep, commandStepDefaults } from '../utils';

export const typeCheckStep = createStep<CustomCommandStep>((ctx) => {
  return {
    ...commandStepDefaults,
    label: ':typescript: Type Check',
    key: 'type_check',
    skip: isSkippable(ctx),
    commands: ['npx ts-node .buildkite/scripts/steps/type_check.ts'],
    env: {
      ECH_GH_STATUS_CONTEXT: 'Type Check',
    },
  };
});

function isSkippable(changes: ChangeContext) {
  const hasTSChanges = changes.files.has('**/*.ts?(x)');
  const hasConfigChanges = changes.files.has(['package.json', 'tsconfig.json']);

  if (hasTSChanges || hasConfigChanges) {
    return false;
  }

  return 'No typescript config nor file changes';
}
