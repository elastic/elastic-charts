/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { common } from '../page_objects/common';

describe('Styles', () => {
  it('should hide the value label with 0 borderWidth', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/bar-chart--with-value-label-advanced&knob-show value label=true&knob-alternating value label=&knob-contain value label within bar element=&knob-hide clipped value=&knob-debug=&knob-useBorder=&knob-value color=rgba(0,0,0,1)&knob-value border color=rgba(0,0,0,1)&knob-value border width=0&knob-Fixed font size=10&knob-Use fixed font size=&knob-Max font size=25&knob-Min font size=10&knob-offsetX=0&knob-offsetY=0&knob-data volume size=s&knob-split series=&knob-stacked series=&knob-chartRotation=0',
    );
  });
  it('should hide the value label with 0 textBorder', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/bar-chart--with-value-label-advanced&knob-show value label=true&knob-alternating value label=&knob-contain value label within bar element=&knob-hide clipped value=&knob-debug=&knob-useBorder=true&knob-value color=rgba(0,0,0,1)&knob-value border color=rgba(0,0,0,1)&knob-value border width=0&knob-Fixed font size=10&knob-Use fixed font size=&knob-Max font size=25&knob-Min font size=10&knob-offsetX=0&knob-offsetY=0&knob-data volume size=s&knob-split series=&knob-stacked series=&knob-chartRotation=0',
    );
  });
});
