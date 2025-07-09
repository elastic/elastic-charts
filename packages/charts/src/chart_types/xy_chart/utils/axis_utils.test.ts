/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DateTime } from 'luxon';
import moment from 'moment-timezone';

import type { TickLabelBounds } from './axis_utils';
import {
  computeRotatedLabelDimensions,
  getPosition,
  getTickLabelPosition,
  isMultilayerTimeAxis,
  isXDomain,
  getScaleForAxisSpec,
} from './axis_utils';
import { computeXScale } from './scales';
import type { AxisSpec, DomainRange } from './specs';
import type { SmallMultipleScales } from '../../../common/panel_utils';
import { MockGlobalSpec /*, MockSeriesSpec*/ } from '../../../mocks/specs/specs';
import { MockXDomain, MockYDomain } from '../../../mocks/xy/domains';
import { ScaleType } from '../../../scales/constants';
import { getSmallMultiplesScale } from '../../../state/utils/get_small_multiples_scale';
import { Position, mergePartial, HorizontalAlignment, VerticalAlignment } from '../../../utils/common';
import { niceTimeFormatter } from '../../../utils/data/formatters';
import type { OrdinalDomain } from '../../../utils/domain';
import type { GroupId } from '../../../utils/ids';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import type { AxisStyle, TextOffset } from '../../../utils/themes/theme';
import { mergeYCustomDomainsByGroupId } from '../state/selectors/merge_y_custom_domains';
import { generateTicks } from '../state/selectors/visible_ticks';

const alignmentsDefault = { horizontal: HorizontalAlignment.Near, vertical: VerticalAlignment.Middle };

const getCustomStyle = (rotation = 0, padding = 10): AxisStyle =>
  mergePartial(LIGHT_THEME.axes, {
    tickLine: {
      size: 10,
      padding,
    },
    tickLabel: {
      fontSize: 16,
      fontFamily: 'Arial',
      rotation,
    },
  });
const style = getCustomStyle();

describe('Axis computational utils', () => {
  const mockedRect = {
    x: 0,
    y: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 10,
    height: 10,
    toJSON: () => '',
  };
  const originalGetBBox = SVGElement.prototype.getBoundingClientRect;

  beforeEach(
    () =>
      (SVGElement.prototype.getBoundingClientRect = function () {
        const text = this.textContent || 0;
        return { ...mockedRect, width: Number(text) * 10, height: Number(text) * 10 };
      }),
  );
  afterEach(() => (SVGElement.prototype.getBoundingClientRect = originalGetBBox));

  const chartDim = {
    width: 100,
    height: 100,
    top: 0,
    left: 0,
  };
  const axis1Dims = {
    maxLabelBboxWidth: 10,
    maxLabelBboxHeight: 10,
    maxLabelTextWidth: 10,
    maxLabelTextHeight: 10,
    isHidden: false,
  };
  const verticalAxisSpec = MockGlobalSpec.yAxis({
    id: 'axis_1',
    title: 'Axis 1',
    groupId: 'group_1',
    hide: false,
    style,
    integersOnly: false,
  });

  const horizontalAxisSpec = MockGlobalSpec.xAxis({
    id: 'axis_2',
    title: 'Axis 2',
    groupId: 'group_1',
    hide: false,
    position: Position.Top,
    style,
    integersOnly: false,
  });

  const xDomain = MockXDomain.fromScaleType(ScaleType.Linear, {
    domain: [0, 1],
    isBandScale: false,
    minInterval: 0,
  });

  const yDomain = MockYDomain.fromScaleType(ScaleType.Linear, {
    groupId: 'group_1',
    domain: [0, 1],
    isBandScale: false,
  });

  const getSmScales = (smHDomain: OrdinalDomain = [], smVDomain: OrdinalDomain = []): SmallMultipleScales => ({
    horizontal: getSmallMultiplesScale(smHDomain, chartDim.width),
    vertical: getSmallMultiplesScale(smVDomain, chartDim.height),
  });

  const emptySmScales = getSmScales();

  const axisTitleStyles = (titleHeight: number, panelTitleHeight?: number) =>
    mergePartial(LIGHT_THEME.axes, {
      axisTitle: {
        fontSize: titleHeight,
        padding: {
          inner: 0,
          outer: 10,
        },
      },
      axisPanelTitle: {
        fontSize: panelTitleHeight,
      },
    });

  test('should compute dimensions for the bounding box containing a rotated label', () => {
    expect(computeRotatedLabelDimensions({ width: 1, height: 2 }, 0)).toEqual({
      width: 1,
      height: 2,
    });

    const dims90 = computeRotatedLabelDimensions({ width: 1, height: 2 }, 90);
    expect(dims90.width).toBeCloseTo(2);
    expect(dims90.height).toBeCloseTo(1);

    const dims45 = computeRotatedLabelDimensions({ width: 1, height: 1 }, 45);
    expect(dims45.width).toBeCloseTo(Math.sqrt(2));
    expect(dims45.height).toBeCloseTo(Math.sqrt(2));
  });

  test('should generate a valid scale', () => {
    const yScale = getScaleForAxisSpec(
      { xDomain, yDomains: [yDomain] },
      { rotation: 0 },
      0,
    )(verticalAxisSpec, [100, 0]);
    expect(yScale).toBeDefined();
    expect(yScale?.bandwidth).toBe(0);
    expect(yScale?.domain).toEqual([0, 1]);
    expect(yScale?.range).toEqual([100, 0]);
    expect(yScale?.ticks()).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);

    const ungroupedAxisSpec = { ...verticalAxisSpec, groupId: 'foo' };
    const nullYScale = getScaleForAxisSpec(
      { xDomain, yDomains: [yDomain] },
      { rotation: 0 },
      0,
    )(ungroupedAxisSpec, [100, 0]);
    expect(nullYScale).toBe(null);

    const xScale = getScaleForAxisSpec(
      { xDomain, yDomains: [yDomain] },
      { rotation: 0 },
      0,
    )(horizontalAxisSpec, [100, 0]);
    expect(xScale).toBeDefined();
  });

  const axisDimensions: TickLabelBounds = {
    maxLabelBboxWidth: 100,
    maxLabelBboxHeight: 100,
    maxLabelTextHeight: 100,
    maxLabelTextWidth: 100,
    isHidden: false,
  };
  const offset: TextOffset = {
    x: 0,
    y: 0,
    reference: 'global',
  };

  describe('getVisibleTicks', () => {
    test.todo('should compute visible ticks for a vertical axis');
    test.todo('should compute visible ticks for a horizontal axis');
    test.todo('should hide some ticks');
    test.todo('should show all overlapping ticks and labels if configured to');
  });

  test('should compute positions and alignment of tick labels along a vertical axis', () => {
    const tickPosition = 0;
    const axisPosition = {
      top: 0,
      left: 0,
      width: 100,
      height: 10,
    };
    const unrotatedLabelProps = getTickLabelPosition(
      getCustomStyle(0, 5),
      tickPosition,
      Position.Left,
      0,
      axisPosition,
      axisDimensions,
      true,
      offset,
      alignmentsDefault,
    );

    expect(unrotatedLabelProps).toEqual({
      offsetX: -50,
      offsetY: 0,
      textOffsetX: 50,
      textOffsetY: 0,
      x: 75,
      y: 0,
      horizontalAlign: 'right',
      verticalAlign: 'middle',
    });

    const rotatedLabelProps = getTickLabelPosition(
      getCustomStyle(90),
      tickPosition,
      Position.Left,
      90,
      axisPosition,
      axisDimensions,
      true,
      offset,
      {
        vertical: 'middle',
        horizontal: 'center',
      },
    );

    expect(rotatedLabelProps).toEqual({
      offsetX: -50,
      offsetY: 0,
      textOffsetX: 0,
      textOffsetY: 0,
      x: 70,
      y: 0,
      horizontalAlign: 'center',
      verticalAlign: 'middle',
    });

    const rightRotatedLabelProps = getTickLabelPosition(
      getCustomStyle(90),
      tickPosition,
      Position.Right,
      90,
      axisPosition,
      axisDimensions,
      true,
      offset,
      {
        horizontal: 'center',
        vertical: 'middle',
      },
    );

    expect(rightRotatedLabelProps).toEqual({
      offsetX: 50,
      offsetY: 0,
      textOffsetX: 0,
      textOffsetY: 0,
      x: 30,
      y: 0,
      horizontalAlign: 'center',
      verticalAlign: 'middle',
    });

    const rightUnrotatedLabelProps = getTickLabelPosition(
      getCustomStyle(),
      tickPosition,
      Position.Right,
      0,
      axisPosition,
      axisDimensions,
      true,
      offset,
      alignmentsDefault,
    );

    expect(rightUnrotatedLabelProps).toEqual({
      offsetX: 50,
      offsetY: 0,
      textOffsetX: -50,
      textOffsetY: 0,
      x: 30,
      y: 0,
      horizontalAlign: 'left',
      verticalAlign: 'middle',
    });
  });

  test('should compute positions and alignment of tick labels along a horizontal axis', () => {
    const tickPosition = 0;
    const axisPosition = {
      top: 0,
      left: 0,
      width: 100,
      height: 10,
    };
    const unrotatedLabelProps = getTickLabelPosition(
      getCustomStyle(0, 5),
      tickPosition,
      Position.Top,
      0,
      axisPosition,
      axisDimensions,
      true,
      offset,
      {
        horizontal: 'center',
        vertical: 'bottom',
      },
    );

    expect(unrotatedLabelProps).toEqual({
      offsetX: 0,
      offsetY: -50,
      textOffsetY: 50,
      textOffsetX: 0,
      x: 0,
      y: -15,
      horizontalAlign: 'center',
      verticalAlign: 'bottom',
    });

    const rotatedLabelProps = getTickLabelPosition(
      getCustomStyle(90),
      tickPosition,
      Position.Top,
      90,
      axisPosition,
      axisDimensions,
      true,
      offset,
      alignmentsDefault,
    );

    expect(rotatedLabelProps).toEqual({
      offsetX: 0,
      offsetY: -50,
      textOffsetX: 50,
      textOffsetY: 0,
      x: 0,
      y: -20,
      horizontalAlign: 'right',
      verticalAlign: 'middle',
    });

    const bottomRotatedLabelProps = getTickLabelPosition(
      getCustomStyle(90),
      tickPosition,
      Position.Bottom,
      90,
      axisPosition,
      axisDimensions,
      true,
      offset,
      alignmentsDefault,
    );

    expect(bottomRotatedLabelProps).toEqual({
      offsetX: 0,
      offsetY: 50,
      textOffsetX: -50,
      textOffsetY: 0,
      x: 0,
      y: 30,
      horizontalAlign: 'left',
      verticalAlign: 'middle',
    });

    const bottomUnrotatedLabelProps = getTickLabelPosition(
      getCustomStyle(90),
      tickPosition,
      Position.Bottom,
      90,
      axisPosition,
      axisDimensions,
      true,
      offset,
      {
        horizontal: 'center',
        vertical: 'top',
      },
    );

    expect(bottomUnrotatedLabelProps).toEqual({
      offsetX: 0,
      offsetY: 50,
      textOffsetX: 0,
      textOffsetY: -50,
      x: 0,
      y: 30,
      horizontalAlign: 'center',
      verticalAlign: 'top',
    });
  });

  test('should compute left axis position', () => {
    const axisTitleHeight = 10;
    const cumTopSum = 10;
    const cumBottomSum = 10;
    const cumLeftSum = 10;
    const cumRightSum = 10;

    const leftAxisPosition = getPosition(
      { chartDimensions: chartDim },
      LIGHT_THEME.chartMargins,
      axisTitleStyles(axisTitleHeight),
      verticalAxisSpec,
      axis1Dims,
      emptySmScales,
      { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum },
      false,
    );
    const expectedLeftAxisPosition = {
      dimensions: {
        height: 100,
        width: 48,
        left: 10,
        top: 0,
      },
      topIncrement: 0,
      bottomIncrement: 0,
      leftIncrement: 48,
      rightIncrement: 0,
    };

    expect(leftAxisPosition).toEqual(expectedLeftAxisPosition);
  });

  test('should compute right axis position', () => {
    const axisTitleHeight = 10;
    const cumTopSum = 10;
    const cumBottomSum = 10;
    const cumLeftSum = 10;
    const cumRightSum = 10;

    verticalAxisSpec.position = Position.Right;
    const rightAxisPosition = getPosition(
      { chartDimensions: chartDim },
      LIGHT_THEME.chartMargins,
      axisTitleStyles(axisTitleHeight),
      verticalAxisSpec,
      axis1Dims,
      emptySmScales,
      { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum },
      false,
    );

    const expectedRightAxisPosition = {
      dimensions: {
        height: 100,
        width: 48,
        left: 110,
        top: 0,
      },
      topIncrement: 0,
      bottomIncrement: 0,
      leftIncrement: 0,
      rightIncrement: 48,
    };

    expect(rightAxisPosition).toEqual(expectedRightAxisPosition);
  });

  test('should compute top axis position', () => {
    const axisTitleHeight = 10;
    const cumTopSum = 10;
    const cumBottomSum = 10;
    const cumLeftSum = 10;
    const cumRightSum = 10;

    horizontalAxisSpec.position = Position.Top;
    const topAxisPosition = getPosition(
      { chartDimensions: chartDim },
      LIGHT_THEME.chartMargins,
      axisTitleStyles(axisTitleHeight),
      horizontalAxisSpec,
      axis1Dims,
      emptySmScales,
      { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum },
      false,
    );
    const { size: tickSize, padding: tickPadding } = LIGHT_THEME.axes.tickLine;

    const expectedTopAxisPosition = {
      dimensions: {
        height: 48 || axis1Dims.maxLabelBboxHeight + axisTitleHeight + tickSize + tickPadding,
        width: 100,
        left: 0,
        top: cumTopSum + LIGHT_THEME.chartMargins.top,
      },
      topIncrement: 48,
      bottomIncrement: 0,
      leftIncrement: 0,
      rightIncrement: 0,
    };

    expect(topAxisPosition).toEqual(expectedTopAxisPosition);
  });

  test('should compute bottom axis position', () => {
    const axisTitleHeight = 10;
    const cumTopSum = 10;
    const cumBottomSum = 10;
    const cumLeftSum = 10;
    const cumRightSum = 10;

    horizontalAxisSpec.position = Position.Bottom;
    const bottomAxisPosition = getPosition(
      { chartDimensions: chartDim },
      LIGHT_THEME.chartMargins,
      axisTitleStyles(axisTitleHeight),
      horizontalAxisSpec,
      axis1Dims,
      emptySmScales,
      { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum },
      false,
    );

    const expectedBottomAxisPosition = {
      dimensions: {
        height: 48,
        width: 100,
        left: 0,
        top: 110,
      },
      topIncrement: 0,
      bottomIncrement: 48,
      leftIncrement: 0,
      rightIncrement: 0,
    };

    expect(bottomAxisPosition).toEqual(expectedBottomAxisPosition);
  });

  test('should determine if axis belongs to yDomain', () => {
    const verticalY = !isXDomain(Position.Left, 0);
    expect(verticalY).toBe(true);

    const verticalX = !isXDomain(Position.Left, 90);
    expect(verticalX).toBe(false);

    const horizontalX = !isXDomain(Position.Top, 0);
    expect(horizontalX).toBe(false);

    const horizontalY = !isXDomain(Position.Top, 90);
    expect(horizontalY).toBe(true);
  });

  describe('isMultilayerTimeAxis', () => {
    test('should return true if chartType is xy_axis, timeAxisLayerCount = 2, position is bottom, x axis type is time, rotation is 0', () => {
      const multilayerTimeAxis = isMultilayerTimeAxis(
        MockGlobalSpec.xAxis({ timeAxisLayerCount: 2, position: 'bottom' }),
        'time',
        0,
      );
      expect(multilayerTimeAxis).toBe(true);
    });

    test('should return false if x axis type is not time', () => {
      const multilayerTimeAxis = isMultilayerTimeAxis(
        MockGlobalSpec.xAxis({ timeAxisLayerCount: 2, position: 'bottom' }),
        'ordinal',
        0,
      );
      expect(multilayerTimeAxis).toBe(false);
    });

    test('should return false timeAxisLayerCount = 0', () => {
      const multilayerTimeAxis = isMultilayerTimeAxis(
        MockGlobalSpec.xAxis({ timeAxisLayerCount: 0, position: 'bottom' }),
        'time',
        0,
      );
      expect(multilayerTimeAxis).toBe(false);
    });

    test('should false true if chart type is not xy_axis', () => {
      const multilayerTimeAxis = isMultilayerTimeAxis(
        { chartType: 'metric', timeAxisLayerCount: 2, position: 'bottom' } as unknown as AxisSpec,
        'time',
        0,
      );
      expect(multilayerTimeAxis).toBe(false);
    });

    test('should return false if xy_axis, timeAxisLayerCount = 2, position is bottom, rotation is not 0', () => {
      const multilayerTimeAxis = isMultilayerTimeAxis(
        MockGlobalSpec.xAxis({ timeAxisLayerCount: 2, position: 'bottom' }),
        'time',
        90,
      );
      expect(multilayerTimeAxis).toBe(false);
    });
  });

  test('should merge axis domains by group id', () => {
    const groupId = 'group_1';
    const domainRange1 = {
      min: 2,
      max: 9,
    };

    verticalAxisSpec.domain = domainRange1;

    const axesSpecs = [verticalAxisSpec];

    // Base case
    const expectedSimpleMap = new Map<GroupId, DomainRange>();
    expectedSimpleMap.set(groupId, { min: 2, max: 9 });

    const simpleDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(simpleDomainsByGroupId).toEqual(expectedSimpleMap);

    // Multiple definitions for the same group
    const domainRange2 = {
      min: 0,
      max: 7,
    };

    const altVerticalAxisSpec = { ...verticalAxisSpec, id: 'axis2' };

    altVerticalAxisSpec.domain = domainRange2;
    axesSpecs.push(altVerticalAxisSpec);

    const expectedMergedMap = new Map<GroupId, DomainRange>();
    expectedMergedMap.set(groupId, { min: 0, max: 9 });

    const mergedDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(mergedDomainsByGroupId).toEqual(expectedMergedMap);

    // xDomain limit (bad config)
    horizontalAxisSpec.domain = {
      min: 5,
      max: 15,
    };
    axesSpecs.push(horizontalAxisSpec);

    const attemptToMerge = () => {
      mergeYCustomDomainsByGroupId(axesSpecs, 0);
    };

    expect(attemptToMerge).toThrow('[Axis axis_2]: custom domain for xDomain should be defined in Settings');
  });

  test('should merge axis domains by group id: partial upper bounded prevDomain with complete domain', () => {
    const groupId = 'group_1';
    const domainRange1 = {
      min: NaN,
      max: 9,
    };

    const domainRange2 = {
      min: 0,
      max: 7,
    };

    verticalAxisSpec.domain = domainRange1;

    const axis2 = { ...verticalAxisSpec, id: 'axis2' };

    axis2.domain = domainRange2;
    const axesSpecs = [verticalAxisSpec, axis2];

    const expectedMergedMap = new Map<GroupId, DomainRange>();
    expectedMergedMap.set(groupId, { min: 0, max: 9 });

    const mergedDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(mergedDomainsByGroupId).toEqual(expectedMergedMap);
  });

  test('should merge axis domains by group id: partial lower bounded prevDomain with complete domain', () => {
    const groupId = 'group_1';
    const domainRange1 = {
      min: -1,
      max: NaN,
    };

    const domainRange2 = {
      min: 0,
      max: 7,
    };

    verticalAxisSpec.domain = domainRange1;
    const axis2 = { ...verticalAxisSpec, id: 'axis2' };

    const axesSpecs = [verticalAxisSpec, axis2];

    axis2.domain = domainRange2;

    const expectedMergedMap = new Map<GroupId, DomainRange>();
    expectedMergedMap.set(groupId, { min: -1, max: 7 });

    const mergedDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(mergedDomainsByGroupId).toEqual(expectedMergedMap);
  });

  test('should merge axis domains by group id: partial upper bounded prevDomain with lower bounded domain', () => {
    const groupId = 'group_1';
    const domainRange1 = {
      min: NaN,
      max: 9,
    };

    const domainRange2 = {
      min: 0,
      max: NaN,
    };

    const domainRange3 = {
      min: -1,
      max: NaN,
    };

    verticalAxisSpec.domain = domainRange1;

    const axesSpecs = [];
    axesSpecs.push(verticalAxisSpec);

    const axis2 = { ...verticalAxisSpec, id: 'axis2' };

    axis2.domain = domainRange2;
    axesSpecs.push(axis2);

    const axis3 = { ...verticalAxisSpec, id: 'axis3' };

    axis3.domain = domainRange3;
    axesSpecs.push(axis3);

    const expectedMergedMap = new Map<GroupId, DomainRange>();
    expectedMergedMap.set(groupId, { min: -1, max: 9 });

    const mergedDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(mergedDomainsByGroupId).toEqual(expectedMergedMap);
  });

  test('should merge axis domains by group id: partial lower bounded prevDomain with upper bounded domain', () => {
    const groupId = 'group_1';
    const domainRange1 = {
      min: 2,
      max: NaN,
    };

    const domainRange2 = {
      min: NaN,
      max: 7,
    };

    const domainRange3 = {
      min: NaN,
      max: 9,
    };

    verticalAxisSpec.domain = domainRange1;

    const axesSpecs = [];
    axesSpecs.push(verticalAxisSpec);

    const axis2 = { ...verticalAxisSpec, id: 'axis2' };

    axis2.domain = domainRange2;
    axesSpecs.push(axis2);

    const axis3 = { ...verticalAxisSpec, id: 'axis3' };

    axis3.domain = domainRange3;
    axesSpecs.push(axis3);

    const expectedMergedMap = new Map<GroupId, DomainRange>();
    expectedMergedMap.set(groupId, { min: 2, max: 9 });

    const mergedDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(mergedDomainsByGroupId).toEqual(expectedMergedMap);
  });

  test('should throw on invalid domain', () => {
    const domainRange1 = {
      min: 9,
      max: 2,
    };

    verticalAxisSpec.domain = domainRange1;

    const axesSpecs = [verticalAxisSpec];

    const attemptToMerge = () => {
      mergeYCustomDomainsByGroupId(axesSpecs, 0);
    };
    const expectedError = '[Axis axis_1]: custom domain is invalid, min is greater than max';

    expect(attemptToMerge).toThrow(expectedError);
  });

  test('should omit first tick on first layer if offset', () => {
    const start = DateTime.fromISO('2019-01-11T00:11:00.000', { zone: 'utc' }).toMillis();
    const end = DateTime.fromISO('2019-01-11T04:11:00.000', { zone: 'utc' }).toMillis();
    const formatter = niceTimeFormatter([start, end]);
    const xDomainTime = MockXDomain.fromScaleType(ScaleType.Time, {
      isBandScale: false,
      domain: [start, end],
      minInterval: moment.duration(30, 'minutes').asMilliseconds(),
    });
    const scale = computeXScale({
      xDomain: xDomainTime,
      totalBarsInCluster: 0,
      range: [0, 603.5],
    });
    const tickFormatOption = { timeZone: 'utc' };
    const result = generateTicks(
      scale,
      scale.ticks(),
      0,
      (v: any) => formatter(v, tickFormatOption),
      0,
      0,
      true,
      false,
    );

    expect(result).toHaveLength(8);
    expect(result).toMatchObject([
      { label: '00:30:00', value: 1547166600000 },
      { label: '01:00:00', value: 1547168400000 },
      { label: '01:30:00', value: 1547170200000 },
      { label: '02:00:00', value: 1547172000000 },
      { label: '02:30:00', value: 1547173800000 },
      { label: '03:00:00', value: 1547175600000 },
      { label: '03:30:00', value: 1547177400000 },
      { label: '04:00:00', value: 1547179200000 },
    ]);
  });

  test('should use custom tick formatter', () => {
    const start = DateTime.fromISO('2019-01-11T00:00:00.000', { zone: 'utc' }).toMillis();
    const interval = moment.duration(1, 'day').asMilliseconds();
    const end = start + interval * 31;
    const tickFormat = niceTimeFormatter([start, end]);
    const xDomainTime = MockXDomain.fromScaleType(ScaleType.Time, {
      isBandScale: false,
      domain: [start, end],
      minInterval: interval,
      timeZone: 'utc',
    });
    const scale = computeXScale({ xDomain: xDomainTime, totalBarsInCluster: 0, range: [0, 603.5] });
    const tickFormatOption = { timeZone: 'utc+1' };
    const result = generateTicks(scale, scale.ticks(), 0, (v) => tickFormat(v, tickFormatOption), 0, 0, true, false);

    expect(result).toHaveLength(17);
    expect(result).toMatchObject([
      { label: '2019-01-11', value: 1547164800000 },
      { label: '2019-01-13', value: 1547337600000 },
      { label: '2019-01-15', value: 1547510400000 },
      { label: '2019-01-17', value: 1547683200000 },
      { label: '2019-01-19', value: 1547856000000 },
      { label: '2019-01-21', value: 1548028800000 },
      { label: '2019-01-23', value: 1548201600000 },
      { label: '2019-01-25', value: 1548374400000 },
      { label: '2019-01-27', value: 1548547200000 },
      { label: '2019-01-29', value: 1548720000000 },
      { label: '2019-01-31', value: 1548892800000 },
      { label: '2019-02-01', value: 1548979200000 },
      { label: '2019-02-03', value: 1549152000000 },
      { label: '2019-02-05', value: 1549324800000 },
      { label: '2019-02-07', value: 1549497600000 },
      { label: '2019-02-09', value: 1549670400000 },
      { label: '2019-02-11', value: 1549843200000 },
    ]);
  });

  test('should omit NaN values from generated ticks', () => {
    const xDomainTime = MockXDomain.fromScaleType(ScaleType.Ordinal, {
      domain: [1, 3, 5],
    });
    const scale = computeXScale({ xDomain: xDomainTime, totalBarsInCluster: 0, range: [0, 10] });
    const ticks = [1, 2, 3, 4, 5];
    const result = generateTicks(scale, ticks, 0, String, 0, 0, true, false);

    expect(result).toHaveLength(3);
    expect(result).toMatchObject([
      { value: 1, label: '1' },
      { value: 3, label: '3' },
      { value: 5, label: '5' },
    ]);
  });

  describe('Small multiples', () => {
    const axisStyles = axisTitleStyles(10, 8);
    const cumTopSum = 10;
    const cumBottomSum = 10;
    const cumLeftSum = 10;
    const cumRightSum = 10;
    const smScales = getSmScales(['a'], [0]);

    describe.each(['test', ''])('Axes title positions - title is "%s"', (title) => {
      test('should compute left axis position', () => {
        const leftAxisPosition = getPosition(
          { chartDimensions: chartDim },
          LIGHT_THEME.chartMargins,
          axisStyles,
          { ...verticalAxisSpec, title },
          axis1Dims,
          smScales,
          { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum },
          false,
        );

        const expectedLeftAxisPosition = {
          dimensions: {
            height: 100,
            width: title ? 64 : 44,
            left: 110,
            top: 0,
          },
          topIncrement: 0,
          bottomIncrement: 0,
          leftIncrement: 0,
          rightIncrement: title ? 64 : 44,
        };

        expect(leftAxisPosition).toEqual(expectedLeftAxisPosition);
      });

      test('should compute right axis position', () => {
        verticalAxisSpec.position = Position.Right;
        const rightAxisPosition = getPosition(
          { chartDimensions: chartDim },
          LIGHT_THEME.chartMargins,
          axisStyles,
          { ...verticalAxisSpec, title },
          axis1Dims,
          smScales,
          { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum },
          false,
        );

        const expectedRightAxisPosition = {
          dimensions: {
            height: 100,
            width: title ? 64 : 44,
            left: 110,
            top: 0,
          },
          topIncrement: 0,
          bottomIncrement: 0,
          leftIncrement: 0,
          rightIncrement: title ? 64 : 44,
        };

        expect(rightAxisPosition).toEqual(expectedRightAxisPosition);
      });

      test('should compute top axis position', () => {
        horizontalAxisSpec.position = Position.Top;
        const topAxisPosition = getPosition(
          { chartDimensions: chartDim },
          LIGHT_THEME.chartMargins,
          axisStyles,
          { ...horizontalAxisSpec, title },
          axis1Dims,
          smScales,
          { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum },
          false,
        );

        const expectedTopAxisPosition = {
          dimensions: {
            height: title ? 64 : 44,
            width: 100,
            left: 0,
            top: 10,
          },
          topIncrement: title ? 64 : 44,
          bottomIncrement: 0,
          leftIncrement: 0,
          rightIncrement: 0,
        };

        expect(topAxisPosition).toEqual(expectedTopAxisPosition);
      });

      test('should compute bottom axis position', () => {
        horizontalAxisSpec.position = Position.Bottom;
        const bottomAxisPosition = getPosition(
          { chartDimensions: chartDim },
          LIGHT_THEME.chartMargins,
          axisStyles,
          { ...horizontalAxisSpec, title },
          axis1Dims,
          smScales,
          { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum },
          false,
        );

        const expectedBottomAxisPosition = {
          dimensions: {
            height: title ? 64 : 44,
            width: 100,
            left: 0,
            top: 110,
          },
          topIncrement: 0,
          bottomIncrement: title ? 64 : 44,
          leftIncrement: 0,
          rightIncrement: 0,
        };
        expect(bottomAxisPosition).toEqual(expectedBottomAxisPosition);
      });
    });
  });
});

it.todo('Test alignment calculations');
it.todo('Test text offsets calculations');
it.todo('Test title padding calculations');
it.todo('Test label padding calculations');
it.todo('Test axis visibility');
