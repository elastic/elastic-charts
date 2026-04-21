/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CustomCommandStep } from '../utils';
import { bkEnv, createStep, commandStepDefaults } from '../utils';

export const chartsPackageStep = createStep<CustomCommandStep>(() => {
  const isPullRequest = bkEnv.isPullRequest;

  return {
    ...commandStepDefaults,
    label: ':package: Build - @elastic/charts tarball',
    key: 'build_charts_package_preview',
    ignoreForced: true,
    skip: isPullRequest ? false : 'Only pull request builds publish charts package tarballs',
    commands: ['npx ts-node .buildkite/scripts/steps/charts_package.ts'],
    env: {
      ECH_CHECK_ID: isPullRequest ? 'build_charts_package_preview' : undefined,
    },
  };
});
