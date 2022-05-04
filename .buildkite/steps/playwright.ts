/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createStep, CustomGroupStep, commandStepDefaults } from '../utils';

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
        parallelism: 1,
        key: parallelKey,
        depends_on: ['e2e_server'],
        plugins: [],
        // plugins: [Plugins.docker.playwright()],
        artifact_paths: ['.buildkite/artifacts/e2e_reports/*', 'e2e/reports/json/report_*.json'],
        commands: ['npx ts-node .buildkite/scripts/steps/playwright.ts'],
      },
      // {
      //   ...commandStepDefaults,
      //   key: 'playwright-merge-and-status',
      //   label: ':playwright: Set group status and merge reports',
      //   skip,
      //   allow_dependency_failure: true,
      //   depends_on: [parallelKey],
      //   commands: ['npx ts-node .buildkite/scripts/steps/e2e_reports.ts'],
      //   env: {
      //     // TODO fix this status update
      //     ECH_GH_STATUS_CONTEXT: 'Playwright e2e',
      //   },
      // },
    ],
  };
});
