/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { eachTheme } from '../helpers';
import { common } from '../page_objects';

describe('Heatmap stories', () => {
  it('should not have brush tool extend into axes', async () => {
    await common.expectChartWithDragAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--basic',
      { left: 100, top: 100 },
      { left: 300, top: 300 },
    );
  });

  eachTheme.describe((_, themeParams) => {
    it('should render basic heatmap', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/heatmap-alpha--basic${themeParams}`,
      );
    });

    it('should render correct brush area', async () => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/heatmap-alpha--basic${themeParams}`,
        { left: 200, top: 100 },
        { left: 400, top: 250 },
      );
    });
  });

  it('should maximize the label with an unique fontSize', async () => {
    await page.setViewport({ width: 450, height: 600 });
    await common.expectChartAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/heatmap-alpha--categorical');
  });

  it('should maximize the label fontSize', async () => {
    await page.setViewport({ width: 420, height: 600 });
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--categorical&knob-use global min fontSize_labels=false',
    );
  });
});
