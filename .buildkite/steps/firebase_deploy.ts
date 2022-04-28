/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createStep, CustomCommandStep, commandStepDefaults } from '../utils';

export const firebaseDeployStep = createStep<CustomCommandStep>(() => {
  return {
    ...commandStepDefaults,
    label: ':firebase: Deploy',
    key: 'deploy',
    allow_dependency_failure: true,
    depends_on: ['storybook', 'e2e_server', { step: 'playwright', allow_failure: true }],
    commands: ['npx ts-node .buildkite/scripts/steps/firebase_deploy.ts'],
    env: {
      ECH_GH_STATUS_CONTEXT: 'Deploy - firebase',
    },
  };
});
