/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createStep, CustomCommandStep, commandStepDefaults } from '../utils';

export const e2eServerStep = createStep<CustomCommandStep>(() => {
  return {
    ...commandStepDefaults,
    label: ':building_construction: E2E server build',
    key: 'e2e_server',
    commands: ['npx ts-node .buildkite/scripts/steps/e2e_server.ts'],
    artifact_paths: ['e2e-server/public/e2e/**/*'],
    env: {
      ECH_GH_STATUS_CONTEXT: 'E2E server build',
    },
  };
});
