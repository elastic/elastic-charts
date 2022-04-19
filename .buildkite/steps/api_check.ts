/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChangeContext, createStep, CustomCommandStep, commandStepDefaults } from '../utils';

export const apiCheckStep = createStep<CustomCommandStep>((ctx) => {
  return {
    ...commandStepDefaults,
    label: ':robot_face: API Check',
    key: 'api_check',
    skip: isSkippable(ctx),
    commands: ['npx ts-node .buildkite/scripts/steps/api_check.ts'],
    env: {
      ECH_GH_STATUS_CONTEXT: 'API Check',
    },
  };
});

function isSkippable(changes: ChangeContext) {
  const hasTSChanges = changes.files.has('**/*.ts?(x)');
  const hasApiConfigChanges = changes.files.has([
    'package.json',
    'packages/charts/package.json',
    'tsconfig.json',
    'packages/charts/tsconfig?(.*).json',
    'packages/charts/api-extractor.jsonc',
  ]);

  if (hasTSChanges || hasApiConfigChanges) {
    return false;
  }

  return 'No api config nor file changes';
}
