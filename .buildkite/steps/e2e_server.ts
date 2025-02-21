/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CustomCommandStep } from '../utils';
import { createStep, commandStepDefaults } from '../utils';

export const e2eServerStep = createStep<CustomCommandStep>(() => {
  return {
    ...commandStepDefaults,
    label: ':building_construction: Build - e2e server',
    key: 'build_e2e',
    commands: ['npx ts-node .buildkite/scripts/steps/e2e_server.ts'],
    env: {
      ECH_CHECK_ID: 'build_e2e',
    },
  };
});
