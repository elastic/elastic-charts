/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { common } from '../page_objects/common';

describe('Accessibility stories', () => {
  it('does not show table for default debug', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      `http://localhost:9001/?path=/story/annotations-lines--advanced-markers&knob-Debug=&knob-show legend=true&knob-chartRotation=0&knob-Side=0&knob-TickLine padding for markerBody=30&knob-Annotation metric=15`,
    );
  });
  it('shows table with debugA11y prop', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      `http://localhost:9001/?path=/story/annotations-lines--advanced-markers&knob-Debug for Accessibility=true&knob-show legend=true&knob-chartRotation=0&knob-Side=0&knob-TickLine padding for markerBody=30&knob-Annotation metric=15`,
    );
  });
});
