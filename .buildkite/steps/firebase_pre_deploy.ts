/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createStep, CustomCommandStep, commandStepDefaults } from '../utils';

export const firebasePreDeployStep = createStep<CustomCommandStep>(() => {
  return {
    ...commandStepDefaults,
    label: ':firebase: Pre Deploy - firebase',
    key: 'pre_deploy_fb',
    allow_dependency_failure: false,
    depends_on: ['build_docs', 'build_storybook', 'build_e2e'],
    commands: ['npx ts-node .buildkite/scripts/steps/firebase_pre_deploy.ts'],
    env: {
      ECH_CHECK_ID: 'pre_deploy_fb',
    },
  };
});
