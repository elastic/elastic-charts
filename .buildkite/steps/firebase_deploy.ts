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
    label: ':firebase: Deploy - firebase',
    key: 'deploy_fb',
    allow_dependency_failure: true,
    depends_on: ['build_docs', 'build_storybook', 'build_e2e', 'playwright_merge_and_status'],
    commands: ['npx ts-node .buildkite/scripts/steps/firebase_deploy.ts'],
    env: {
      ECH_CHECK_ID: 'deploy_fb',
    },
  };
});
