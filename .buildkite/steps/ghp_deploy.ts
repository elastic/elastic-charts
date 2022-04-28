/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createStep, CustomCommandStep, commandStepDefaults, bkEnv } from '../utils';

export const ghpDeployStep = createStep<CustomCommandStep>(() => {
  return {
    ...commandStepDefaults,
    label: ':github: Deploy',
    key: 'ghp-deploy',
    skip: bkEnv.branch === 'master' ? false : 'Not target branch',
    depends_on: ['storybook'],
    commands: ['npx ts-node .buildkite/scripts/steps/ghp_deploy.ts'],
    env: {
      ECH_GH_STATUS_CONTEXT: 'Deploy - GitHub pages',
    },
  };
});
