/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChangeContext, CustomCommandStep } from '../utils';
import { createStep, commandStepDefaults } from '../utils';

export const euiColorsCheckStep = createStep<CustomCommandStep>((ctx) => {
  return {
    ...commandStepDefaults,
    label: ':art: EUI colors',
    key: 'eui_colors',
    skip: isSkippable(ctx),
    commands: ['npx ts-node .buildkite/scripts/steps/eui_colors_check.ts'],
    env: {
      ECH_CHECK_ID: 'eui_colors',
    },
  };
});

function isSkippable(changes: ChangeContext): boolean | string {
  const hasEuiColorsChanges = changes.files.has([
    'yarn.lock',
    'package.json',
    'packages/charts/package.json',
    'packages/charts/scripts/*eui_colors*',
    'packages/charts/src/utils/themes/eui_borealis_colors*',
  ]);

  if (hasEuiColorsChanges) {
    return false;
  }

  return 'No EUI colors nor dependency changes';
}
