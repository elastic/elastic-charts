/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects';

test.describe('Grid stories', () => {
  test('should render crosshair lines above grid lines', async ({ page }) => {
    await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/grids--lines&knob-Stroke_Crosshair line=red&knob-Stroke width_Crosshair line=10&knob-Dash_Crosshair line[0]=0&knob-Dash_Crosshair line[1]=0&knob-Stroke_Crosshair cross line=red&knob-Stroke width_Crosshair cross line=10&knob-Dash_Crosshair cross line[0]=0&knob-Dash_Crosshair cross line[1]=0&knob-debug=&knob-Tooltip type=cross&knob-Show gridline_Left axis=true&knob-Opacity_Left axis=1&knob-Stroke_Left axis=rgba(0,0,0,1)&knob-Stroke width_Left axis=2&knob-Dash_Left axis[0]=4&knob-Dash_Left axis[1]=4&knob-Show gridline_Bottom axis=true&knob-Opacity_Bottom axis=1&knob-Stroke_Bottom axis=rgba(0,0,0,1)&knob-Stroke width_Bottom axis=2',
      { top: 115, right: 120 },
    );
  });
});
