/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { common } from '../page_objects';

describe('Heatmap stories', () => {
  it('should not have brush tool extend into axes', async () => {
    await common.expectChartWithDragAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--basic',
      { left: 100, top: 100 },
      { left: 300, top: 300 },
    );
  });
  it('should allow text color contrast', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--text-color-contrast&globals=theme:eui-light&knob-set%20the%20pageBackgroundColor%20parameter%20in%20the%20config=#000000&knob-set%20the%20textContrast%20parameter%20in%20the%20config=true',
    );
  });
});
