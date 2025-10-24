/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CustomCommandStep } from '../utils';
import { createStep, commandStepDefaults } from '../utils';

export const docsStep = createStep<CustomCommandStep>(() => {
  return {
    ...commandStepDefaults,
    label: ':docusaurus: Build - Docs',
    key: 'build_docs',
    timeout_in_minutes: 20,
    commands: ['npx ts-node .buildkite/scripts/steps/docs.ts'],
    env: {
      ECH_CHECK_ID: 'build_docs',
    },
  };
});
