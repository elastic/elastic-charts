/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getStorybookInfo } from '../helpers';
import { common } from '../page_objects';

// mock required for importing trick, otherwise .scss files will throw an error
jest.mock('../../storybook/theme_service.ts', () => ({
  switchTheme: () => undefined,
}));

const storyGroups = getStorybookInfo();

describe('Baseline Visual tests for all stories', () => {
  describe.each(storyGroups)('%s', (_group, encodedGroup, stories) => {
    describe.each(stories)('%s', (_title, encodedTitle) => {
      it('visually looks correct', async () => {
        const url = `http://localhost:9001?id=${encodedGroup}--${encodedTitle}`;
        await common.expectChartAtUrlToMatchScreenshot(url);
      });
    });
  });
});
