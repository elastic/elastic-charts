/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CustomGroupStep } from '../utils';
import { createStep, commandStepDefaults, Plugins } from '../utils';

export const playwrightStep = createStep<CustomGroupStep>(() => {
  const skip = false;
  const parallelKey = 'playwright__parallel-step';
  return {
    group: ':playwright: Playwright e2e VRT',
    key: 'playwright',
    skip,
    steps: [
      {
        ...commandStepDefaults,
        label: ':playwright: Playwright e2e VRT',
        skip,
        parallelism: 10,
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
        timeout_in_minutes: 30, // buildkite sees timeouts as non-failures making them hard to handle
        key: parallelKey,
        depends_on: ['build_e2e'],
        plugins: [Plugins.docker.playwright()],
        artifact_paths: [
          '.buildkite/artifacts/e2e_reports/*',
          '.buildkite/artifacts/screenshots/*',
          '.buildkite/artifacts/screenshot_meta/*',
          'e2e/reports/json/*',
        ],
        commands: ['npx ts-node .buildkite/scripts/steps/playwright.ts'],
      },
      {
        ...commandStepDefaults,
        key: 'playwright_merge_and_status',
        label: ':playwright: Set group status and merge reports',
        skip,
        allow_dependency_failure: true,
        depends_on: [{ step: parallelKey, allow_failure: true }],
        commands: ['npx ts-node .buildkite/scripts/steps/e2e_reports.ts'],
        env: {
          ECH_CHECK_ID: 'playwright',
        },
      },
    ],
  };
});
