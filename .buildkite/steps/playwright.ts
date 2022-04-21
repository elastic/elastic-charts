/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createStep, CustomGroupStep, commandStepDefaults, Plugins } from '../utils';

export const playwrightStep = createStep<CustomGroupStep>(() => {
  const skip = false;
  const parallelKey = 'playwright__parallel-step';
  return {
    group: ':playwright: Playwright e2e',
    key: 'playwright',
    steps: [
      {
        ...commandStepDefaults,
        label: ':playwright: Playwright e2e',
        skip,
        parallelism: 12,
        key: parallelKey,
        // depends_on: ['e2e_server'],
        artifact_paths: ['e2e/reports/**/*', 'e2e/test_failures/**/*'],
        plugins: [Plugins.docker.playwright()],
        commands: ['npx ts-node .buildkite/scripts/steps/playwright.ts'],
      },
      {
        ...commandStepDefaults,
        label: ':playwright: Set group status and deploy report',
        skip,
        allow_dependency_failure: true,
        depends_on: [parallelKey],
        artifact_paths: ['e2e-server/public/e2e-report/**/*'],
        commands: ['npx ts-node .buildkite/scripts/steps/e2e_reports.ts'],
        env: {
          ECH_GH_STATUS_CONTEXT: 'Playwright e2e',
        },
      },
    ],
  };
});
