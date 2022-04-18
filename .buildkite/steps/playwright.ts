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
        skip: skip,
        parallelism: 2,
        key: parallelKey,
        depends_on: ['deploy'],
        artifact_paths: ['e2e/reports/**/*'],
        plugins: [Plugins.docker.playwright(['PLAYWRIGHT_HTML_REPORT'])],
        commands: ['npx ts-node .buildkite/scripts/steps/playwright.ts'],
        env: {
          PLAYWRIGHT_HTML_REPORT: 'reports/report_%n', // TODO check this works
        },
      },
      {
        ...commandStepDefaults,
        label: ':playwright: Playwright e2e - Set group status',
        skip: skip,
        allow_dependency_failure: true,
        depends_on: [parallelKey],
        commands: ['echo "running playright tests"'], // TODO this
        env: {
          ECH_GH_STATUS_CONTEXT: 'Playwright e2e',
        },
      },
    ],
  };
});
