/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createStep, CustomCommandStep, commandStepDefaults, bkEnv } from '../utils';

export const ghpDeployStep = createStep<CustomCommandStep>(() => {
  const isMaster = bkEnv.isMaster;

  return {
    ...commandStepDefaults,
    label: ':github: Deploy - GitHub Pages',
    key: 'deploy_ghp',
    skip: isMaster ? false : 'Not target branch',
    depends_on: ['build_storybook'],
    commands: ['npx ts-node .buildkite/scripts/steps/ghp_deploy.ts'],
    env: {
      // ignore check run reporting when not master
      ECH_CHECK_ID: isMaster ? 'deploy_ghp' : undefined,
    },
  };
});
