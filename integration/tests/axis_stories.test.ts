/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Position } from '../../packages/charts/src';
import { eachRotation } from '../helpers';
import { common } from '../page_objects';

describe('Axis stories', () => {
  it('should switch to a 30 minute raster', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--timeslip&globals=theme:light&knob-Data%20type=Base%202&knob-Data%20type_X%20-%20Axis=increasing&knob-Data%20type_Y%20-%20Axis=upDown&knob-Debug=true&knob-Fit%20domain_Y%20-%20Axis=true&knob-Legend=true&knob-Legend%20position=right&knob-Log%20base_X%20-%20Axis=common&knob-Log%20base_Y%20-%20Axis=binary&knob-Log%20min%20limit_X%20-%20Axis=1&knob-Log%20min%20limit_Y%20-%20Axis=1&knob-Minor%20grid%20lines=true&knob-Nice%20y%20ticks=true&knob-Padding_Y%20-%20Axis=0&knob-Rotation%20degree=90&knob-Rows%20in%20dataset=11&knob-Scale%20Type_X%20-%20Axis=log&knob-Scale%20Type_Y%20-%20Axis=log&knob-Series%20Type=line&knob-Shorter%20X%20axis%20minor%20whiskers=true&knob-Time%20stretch=2&knob-Use%20default%20limit_X%20-%20Axis=true&knob-X%20axis%20minor%20whiskers=true&knob-bottom%20show%20overlapping%20labels=true&knob-fit=true&knob-left%20show%20overlapping%20labels=true&knob-logMinLimit=10&knob-yScaleType=linear_binary',
    );
  });
  it('should render proper tick count', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--basic&knob-Tick Label Padding=0&knob-debug=&knob-Bottom overlap labels=&knob-Bottom overlap ticks=true&knob-Number of ticks on bottom=20&knob-Left overlap labels=&knob-Left overlap ticks=true&knob-Number of ticks on left=10',
    );
  });
  it('should render proper tick count with showOverlappingLabels', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--basic&knob-Tick Label Padding=0&knob-debug=&knob-Bottom overlap labels_Bottom Axis=true&knob-Bottom overlap ticks_Bottom Axis=true&knob-Number of ticks on bottom_Bottom Axis=20&knob-Left overlap labels_Left Axis=&knob-Left overlap ticks_Left Axis=true&knob-Number of ticks on left_Left Axis=10',
    );
  });
  it('should render ticks with varied rotations', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--tick-label-rotation&knob-Tick Label Padding=0&knob-bottom axis tick label rotation=47&knob-hide bottom axis=&knob-left axis tick label rotation=-56&knob-hide left axis=&knob-top axis tick label rotation=-59&knob-hide top axis=&knob-right axis tick label rotation=30&knob-hide right axis=&knob-debug=',
    );
  });
  it('should hide bottom axis', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--tick-label-rotation&knob-Tick Label Padding=0&knob-bottom axis tick label rotation=47&knob-hide bottom axis=true&knob-left axis tick label rotation=-56&knob-hide left axis=&knob-top axis tick label rotation=-59&knob-hide top axis=&knob-right axis tick label rotation=30&knob-hide right axis=&knob-debug=',
    );
  });
  it('should hide top axis', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--tick-label-rotation&knob-Tick Label Padding=0&knob-bottom axis tick label rotation=47&knob-hide bottom axis=&knob-left axis tick label rotation=-56&knob-hide left axis=&knob-top axis tick label rotation=-59&knob-hide top axis=true&knob-right axis tick label rotation=30&knob-hide right axis=&knob-debug=',
    );
  });
  it('should hide left axis', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--tick-label-rotation&knob-Tick Label Padding=0&knob-bottom axis tick label rotation=47&knob-hide bottom axis=&knob-left axis tick label rotation=-56&knob-hide left axis=true&knob-top axis tick label rotation=-59&knob-hide top axis=&knob-right axis tick label rotation=30&knob-hide right axis=&knob-debug=',
    );
  });
  it('should hide right axis', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--tick-label-rotation&knob-Tick Label Padding=0&knob-bottom axis tick label rotation=47&knob-hide bottom axis=&knob-left axis tick label rotation=-56&knob-hide left axis=&knob-top axis tick label rotation=-59&knob-hide top axis=&knob-right axis tick label rotation=30&knob-hide right axis=true&knob-debug=',
    );
  });
  it('should render tick padding', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--many-tick-labels&knob-Tick Label Padding=60',
    );
  });
  it('should render with domain constraints', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--custom-mixed&knob-left min=2&knob-xDomain max=2',
    );
  });
  it('should hide consecutive duplicate ticks', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--duplicate-ticks&knob-formatter=hourly&knob-Show duplicate ticks in x axis=true',
    );
  });

  it('should render correctly rotated ticks', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--tick-label-rotation&knob-debug_general=true&knob-disable%20axis%20overrides_general=false&knob-Tick%20label%20rotation_bottom=47&knob-Tick%20label%20rotation_left=-54&knob-Tick%20label%20rotation_top=69&knob-Tick%20label%20rotation_right=48&knob-Tick%20label%20rotation_shared=30',
    );
  });

  eachRotation.it(async (rotation) => {
    await common.expectChartAtUrlToMatchScreenshot(
      `http://localhost:9001/?path=/story/axes--tick-label-rotation&knob-disable axis overrides_general=true&knob-Tick label rotation_shared=${rotation}`,
    );
  }, 'should render correctly rotated ticks - %s');

  describe('Small multiples', () => {
    const allPositions = [Position.Top, Position.Right, Position.Bottom, Position.Left];
    const showAllParams = allPositions.map((p) => `knob-Hide_${p}=false`).join('&');

    it('should render four axes with titles and panel titles', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/small-multiples-alpha--grid-lines&${showAllParams}`,
      );
    });

    it('should render four axes with no gridlines', async () => {
      const hideAllGridParams = allPositions.map((p) => `knob-Show grid line_${p}=false`).join('&');
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/small-multiples-alpha--grid-lines&${showAllParams}&${hideAllGridParams}`,
      );
    });

    describe.each<Position>(allPositions)('Axis position - %s', (position) => {
      it.each<[string, string]>([
        ['should hide title', `knob-Hide title_${position}=true`],
        ['should hide empty title', `knob-Title_${position}=%20&knob-Hide title_${position}=false`],
        ['should hide panel titles', `knob-Hide panel titles_${position}=true`],
      ])('%s', async (_, params) => {
        await common.expectChartAtUrlToMatchScreenshot(
          `http://localhost:9001/?path=/story/small-multiples-alpha--grid-lines&${showAllParams}&${params}`,
        );
      });
    });
  });
});
