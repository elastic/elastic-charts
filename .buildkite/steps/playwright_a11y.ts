/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CustomGroupStep } from '../utils';
import { createStep, commandStepDefaults, Plugins } from '../utils';

export const playwrightA11yStep = createStep<CustomGroupStep>(() => {
  const skip = false;
  const parallelKey = 'playwright_a11y__parallel-step';
  return {
    group: ':playwright: Playwright a11y',
    key: 'playwright_a11y',
    skip,
    steps: [
      {
        ...commandStepDefaults,
        label: ':playwright: Playwright a11y',
        skip,
        parallelism: 5,
        retry: {
          automatic: [
            {
              // Playwright tests likely failed correctly
              exit_status: 1,
              limit: 0,
            },
            {
              // Something went wrong with step command setup, retry once
              exit_status: '*',
              limit: 1,
            },
          ],
        },
        timeout_in_minutes: 10, // Shorter timeout for a11y tests
        key: parallelKey,
        depends_on: ['build_e2e'],
        plugins: [Plugins.docker.playwright()],
        artifact_paths: ['.buildkite/artifacts/a11y_reports/*', 'e2e/reports/a11y-json/*'],
        commands: ['npx ts-node .buildkite/scripts/steps/playwright_a11y.ts'],
      },
      {
        ...commandStepDefaults,
        key: 'playwright_a11y_merge_and_status',
        label: ':playwright: Set a11y group status and merge reports',
        skip,
        allow_dependency_failure: true,
        depends_on: [{ step: parallelKey, allow_failure: true }],
        commands: ['npx ts-node .buildkite/scripts/steps/e2e_reports.ts'],
        env: {
          ECH_CHECK_ID: 'playwright_a11y',
        },
      },
    ],
  };
});
