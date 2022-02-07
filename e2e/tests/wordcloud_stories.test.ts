/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { pwEach } from '../helpers';
import { common } from '../page_objects';

export const TEMPLATES = ['edit', 'single', 'rightAngled', 'multiple', 'squareWords', 'smallWaves', 'sparse'];

test.describe('Scales stories', () => {
  pwEach.test(TEMPLATES.filter((t) => t !== 'edit'))(
    (t) => `should render ${t} wordcloud template`,
    async (page, template) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud&knob-template=${template}`,
      );
    },
  );
});
