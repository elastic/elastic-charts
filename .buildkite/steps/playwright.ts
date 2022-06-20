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
        parallelism: 1,
        key: parallelKey,
        // depends_on: ['build_e2e'],
        plugins: [Plugins.docker.playwright(['UPDATE_SCREENSHOTS'])],
        artifact_paths: [
          '.buildkite/artifacts/e2e_reports/*',
          '.buildkite/artifacts/screenshots/*',
          '.buildkite/artifacts/screenshot_meta/*',
          'e2e/reports/json/*',
        ],
        commands: ['npx ts-node .buildkite/scripts/steps/playwright.ts'],
        env: {
          UPDATE_SCREENSHOTS: 'true',
        },
      },
      {
        ...commandStepDefaults,
        key: 'playwright-merge-and-status',
        label: ':playwright: Set group status and merge reports',
        skip,
        allow_dependency_failure: true,
        depends_on: [parallelKey],
        commands: ['npx ts-node .buildkite/scripts/steps/e2e_reports.ts'],
        env: {
          // TODO: fix this status update
          ECH_CHECK_ID: 'playwright',
          UPDATE_SCREENSHOTS: 'true',
        },
      },
    ],
  };
});
