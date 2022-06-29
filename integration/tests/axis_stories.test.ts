/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Position } from '../../packages/charts/src';
import { eachRotation, eachTheme } from '../helpers';
import { common } from '../page_objects';

describe('Axis stories', () => {
  eachTheme.describe((_, params) => {
    it('should switch to a 30 minute raster', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/area-chart--timeslip&${params}&knob-Minor%20grid%20lines=true&knob-Shorter%20X%20axis%20minor%20whiskers=true&knob-Stretch%20time=-6&knob-Time%20stretch=100&knob-Time%20zoom=119&knob-X%20axis%20minor%20whiskers=true`,
      );
    });
  });
  it('should use a decades raster', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--timeslip&globals=theme:light&knob-Minor%20grid%20lines=true&knob-Shift%20time=0&knob-Shorter%20X%20axis%20minor%20whiskers=true&knob-Stretch%20time=18&knob-Time%20zoom=120&knob-X%20axis%20minor%20whiskers=true&knob-showOverlappingLabels%20time%20axis=true',
    );
  });
  it('should included select annotation y domains', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/axes--fit-domain&globals=theme:light&knob-dataset=positive&knob-fit%20Y%20domain%20to%20data=true&knob-Specs%20to%20fit%20(yDomain)[0]=theshold&knob-Specs%20to%20fit%20(yDomain)[1]=rect&knob-constrain%20padding=true&knob-domain%20padding=0.1&knob-Domain%20padding%20unit=domainRatio&knob-thesholds%20-%20line[0]=1300&knob-theshold%20-%20rect={%22y0%22:-200,%22y1%22:null}',
    );
  });
  it('should have st nd rd th after day-of-month numbers', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--timeslip&globals=theme:light&knob-Minor%20grid%20lines=true&knob-Shift%20time=-4.3&knob-Shorter%20X%20axis%20minor%20whiskers=true&knob-Stretch%20time=4.8&knob-Time%20zoom=120&knob-X%20axis%20minor%20whiskers=true&knob-showOverlappingLabels%20time%20axis=true&knob-showOverlappingTicks%20time%20axis=true',
    );
  });
  it('should have st nd rd th after day-of-month numbers even for the 20s', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--timeslip&globals=theme:light&knob-Minor%20grid%20lines=true&knob-Shift%20time=8.5&knob-Shorter%20X%20axis%20minor%20whiskers=true&knob-Stretch%20time=4.8&knob-Time%20zoom=120&knob-X%20axis%20minor%20whiskers=true&knob-showOverlappingLabels%20time%20axis=true&knob-showOverlappingTicks%20time%20axis=true',
    );
  });
  it('should not show a raster that is finer than the bin width (minInterval)', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--timeslip&Bin%20width%20in%20ms%20(0:%20none%20specifed)=60000&Minor%20grid%20lines=on&Shift%20time=0&Stretch%20time=-0.4&Time%20zoom=2&globals=theme:light&knob-Bin%20width%20in%20ms%20(0:%20none%20specifed)=60000&knob-Minor%20grid%20lines=true&knob-Shift%20time=0&knob-Stretch%20time=-0.4&knob-Time%20zoom=2&knob-layerCount=3&layerCount=3',
    );
  });
  it('can show a finer raster than the data bin width if minInterval is expressly specified to be low', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--timeslip&Bin%20width%20in%20ms%20(0:%20none%20specifed)=1&Minor%20grid%20lines=on&Shift%20time=0&Stretch%20time=-0.4&Time%20zoom=2&globals=theme:light&knob-Bin%20width%20in%20ms%20(0:%20none%20specifed)=1&knob-Minor%20grid%20lines=true&knob-Shift%20time=0&knob-Stretch%20time=-0.4&knob-Time%20zoom=2&knob-layerCount=3&layerCount=3',
    );
  });
  it('can render multilayer time axis on top', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--timeslip&globals=theme:light&knob-Bin width in ms (0: none specifed)=0&knob-Minor grid lines=true&knob-Shift time=8.5&knob-Shorter X axis minor whiskers=true&knob-Stretch time=6.8&knob-Time zoom=120&knob-X axis minor whiskers=true&knob-fallback placement=left-start&knob-layerCount=3&knob-placement=left&knob-placement offset=5&knob-showOverlappingLabels time axis=true&knob-showOverlappingTicks time axis=true&knob-stickTo=MousePosition&knob-Horizontal axis title=&knob-Top X axis=true',
    );
  });
  it('uses proper english ending at a daily resolution, 30th....14th', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--timeslip&globals=theme:light&knob-Bin width in ms (0: none specifed)=0&knob-Minor grid lines=true&knob-Shift time=-7.1&knob-Stretch time=6.6&knob-Time zoom=120&knob-layerCount=3&knob-Horizontal axis title=&knob-Top X axis=&knob-showOverlappingTicks time axis=&knob-showOverlappingLabels time axis=',
    );
  });
  it('uses proper english ending at a daily resolution, 10th...25th', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--timeslip&globals=theme:light&knob-Bin width in ms (0: none specifed)=0&knob-Minor grid lines=true&knob-Shift time=-9.8&knob-Stretch time=6.6&knob-Time zoom=120&knob-layerCount=3&knob-Horizontal axis title=&knob-Top X axis=&knob-showOverlappingTicks time axis=&knob-showOverlappingLabels time axis=',
    );
  });
  it('uses proper english ending at a weekly resolution', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--timeslip&globals=theme:light&knob-Bin width in ms (0: none specifed)=0&knob-Minor grid lines=true&knob-Shift time=-8.3&knob-Stretch time=10&knob-Time zoom=120&knob-layerCount=3&knob-Horizontal axis title=&knob-Top X axis=&knob-showOverlappingTicks time axis=&knob-showOverlappingLabels time axis=',
    );
  });
  it('should extend the domain on the right with one bin width with custom bin width', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/bar-chart--test-discover&globals=theme:light&knob-Minor%20grid%20lines=true&knob-Pan%20time=0&knob-Shift%20time=0&knob-Shorter%20X%20axis%20minor%20whiskers=true&knob-Stretch%20time=3.8&knob-Time%20zoom=120&knob-X%20axis%20minor%20whiskers=true&knob-layerCount=3&knob-showOverlappingLabels%20time%20axis=true&knob-showOverlappingTicks%20time%20axis=true&knob-use%20custom%20minInterval%20of%2030s=true&knob-use%20multilayer%20time%20axis=true',
    );
  });
  it('should extend the domain on the right with one bin width without custom bin width', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/bar-chart--test-discover&globals=theme:light&knob-Minor%20grid%20lines=true&knob-Pan%20time=0&knob-Shift%20time=0&knob-Shorter%20X%20axis%20minor%20whiskers=true&knob-Stretch%20time=3.8&knob-Time%20zoom=120&knob-X%20axis%20minor%20whiskers=true&knob-layerCount=3&knob-showOverlappingLabels%20time%20axis=true&knob-showOverlappingTicks%20time%20axis=true&knob-use%20custom%20minInterval%20of%2030s=false&knob-use%20multilayer%20time%20axis=true',
    );
  });
  it('renders multilayer time axis with a single point and an arbitrary non-degenerate domain', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/bar-chart--test-single-histogram-bar-chart&globals=theme:light&knob-non-round time domain start=true&knob-use multilayer time axis=true&knob-use lines instead of bars=true',
    );
  });
  it('renders multilayer time axis with a single point and a degenerate, zero width domain', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/bar-chart--test-single-histogram-bar-chart&globals=theme:light&knob-non-round time domain start=&knob-use multilayer time axis=true&knob-use lines instead of bars=true',
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
