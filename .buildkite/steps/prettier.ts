/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CustomCommandStep } from '../utils';
import { createStep, commandStepDefaults } from '../utils';

export const prettierStep = createStep<CustomCommandStep>(() => {
  return {
    ...commandStepDefaults,
    label: ':prettier: Prettier',
    key: 'prettier',
    skip: false, // TODO: add skippable logic - hard to tell what exactly would cause this and task is lightweight
    commands: ['npx ts-node .buildkite/scripts/steps/prettier.ts'],
    env: {
      ECH_CHECK_ID: 'prettier',
    },
  };
});
