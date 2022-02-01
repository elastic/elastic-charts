/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';
import { paramCase } from 'change-case';

import { getStorybookInfo } from '../helpers';
import { common } from '../page_objects';

const storyGroups = getStorybookInfo();

// Top level is needed to run in parallel
test.describe.parallel('Baselines', () => {
  storyGroups.slice(0, 1).forEach(({ group, stories, encodedGroup }) => {
    test.describe.parallel(group, () => {
      stories.slice(0, 1).forEach(({ name, slugifiedName }) => {
        // takes camelCase storybook name and converts to dash-case for file naming
        test(paramCase(name), async ({ page }) => {
          const url = `http://localhost?id=${encodedGroup}--${slugifiedName}`;
          await common.expectChartAtUrlToMatchScreenshot(page)(url);
        });
      });
    });
  });
});
