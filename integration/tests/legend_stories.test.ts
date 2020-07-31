/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { common } from '../page_objects';

describe('Legend stories', () => {
  it('should render non-split series', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--changing-specs&knob-split series=',
    );
  });
  it('should hide line series legend item', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--hide-legend-items-by-series&knob-hide bar series in legend=&knob-hide line series in legend=true',
    );
  });
  it('should hide bar series legend item', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--hide-legend-items-by-series&knob-hide bar series in legend=true&knob-hide line series in legend=',
    );
  });
  it('should 0 legend buffer', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--legend-spacing-buffer&knob-legend buffer value=0',
    );
  });

  it('should render color picker on mouse click', async () => {
    const action = async () =>
      await common.clickMouseRelativeToDOMElement({ left: 0, top: 0 }, '.echLegendItem__color');
    await common.expectElementAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--color-picker',
      'body',
      {
        action,
        waitSelector: common.chartWaitSelector,
        delay: 500, // needed for popover animation to complete
      },
    );
  });

  it('should render legend action on mouse hover', async () => {
    const action = async () => await common.moveMouseRelativeToDOMElement({ left: 30, top: 10 }, '.echLegendItem');
    await common.expectChartAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/legend--actions', {
      action,
      delay: 200, // needed for icon to load
    });
  });

  describe('Tooltip placement with legend', () => {
    it('should render tooltip with left legend', async () => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/legend--left', {
        bottom: 190,
        left: 310,
      });
    });

    it('should render tooltip with top legend', async () => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/legend--top', {
        top: 150,
        left: 320,
      });
    });

    it('should render tooltip with right legend', async () => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/legend--right', {
        bottom: 180,
        left: 330,
      });
    });

    it('should render tooltip with bottom legend', async () => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/legend--bottom', {
        top: 150,
        left: 320,
      });
    });
  });
});
