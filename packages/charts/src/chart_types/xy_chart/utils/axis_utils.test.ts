/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DateTime } from 'luxon';
import moment from 'moment-timezone';

import {
  TickLabelBounds,
  computeRotatedLabelDimensions,
  getPosition,
  // getAxesGeometries,
  getTickLabelPosition,
  isMultilayerTimeAxis,
  isXDomain,
  getScaleForAxisSpec,
} from './axis_utils';
import { computeXScale } from './scales';
import { AxisSpec, DomainRange, DEFAULT_GLOBAL_ID, TickFormatter } from './specs';
import { SmallMultipleScales } from '../../../common/panel_utils';
import { MockGlobalSpec /*, MockSeriesSpec*/ } from '../../../mocks/specs/specs';
// import { MockStore } from '../../../mocks/store/store';
import { MockXDomain, MockYDomain } from '../../../mocks/xy/domains';
import { ScaleType } from '../../../scales/constants';
import { getScale } from '../../../state/selectors/compute_small_multiple_scales';
import { Position, mergePartial, HorizontalAlignment, VerticalAlignment } from '../../../utils/common';
import { niceTimeFormatter } from '../../../utils/data/formatters';
import { OrdinalDomain } from '../../../utils/domain';
import { GroupId } from '../../../utils/ids';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import { AxisStyle, TextOffset } from '../../../utils/themes/theme';
/*
import { computeAxesGeometriesSelector } from '../state/selectors/compute_axes_geometries';
import {
  AxesTicksDimensions,
  computeAxisTicksDimensionsSelector,
} from '../state/selectors/compute_axis_ticks_dimensions';
*/
// import { getAxesStylesSelector } from '../state/selectors/get_axis_styles';
// import { getGridLinesSelector } from '../state/selectors/get_grid_lines';
import { mergeYCustomDomainsByGroupId } from '../state/selectors/merge_y_custom_domains';
import { generateTicks } from '../state/selectors/visible_ticks';

const alignmentsDefault = { horizontal: HorizontalAlignment.Near, vertical: VerticalAlignment.Middle };

const layer = 0;
const detailedLayer = 0;

// const NO_ROTATION = 0;

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

  /*
    const verticalAxisSpecWTitle = MockGlobalSpec.yAxis({
      chartType: ChartType.XYAxis,
      specType: SpecType.Axis,
      id: 'axis_1',
      groupId: 'group_1',
      title: 'v axis',
      hide: false,
      showOverlappingTicks: false,
      showOverlappingLabels: false,
      position: Position.Left,
      style,
      integersOnly: false,
    });
  const lineSeriesSpec = MockSeriesSpec.line({
    id: 'line',
    groupId: 'group_1',
    xAccessor: 0,
    yAccessors: [1],
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
    data: [
      [0, 0],
      [0.5, 0.5],
      [1, 1],
    ],
  });
  */
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
    horizontal: getScale(smHDomain, chartDim.width),
    vertical: getScale(smVDomain, chartDim.height),
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

  /*
  describe('getAvailableTicks', () => {
    test('should compute to end of domain when histogram mode not enabled', () => {
      const scale = getScaleForAxisSpec(
        { xDomain, yDomains: [yDomain] },
        { rotation: 0 },
        0,
      )(verticalAxisSpec, [100, 0]);
      const axisPositions = getAvailableTicks(verticalAxisSpec, scale as Scale<number>, 0, false, (v) => `${v}`, 0);
      const expectedAxisPositions = [
        { label: '0', axisTickLabel: '0', position: 100, value: 0, layer },
        { label: '0.1', axisTickLabel: '0.1', position: 90, value: 0.1, layer },
        { label: '0.2', axisTickLabel: '0.2', position: 80, value: 0.2, layer },
        { label: '0.3', axisTickLabel: '0.3', position: 70, value: 0.3, layer },
        { label: '0.4', axisTickLabel: '0.4', position: 60, value: 0.4, layer },
        { label: '0.5', axisTickLabel: '0.5', position: 50, value: 0.5, layer },
        { label: '0.6', axisTickLabel: '0.6', position: 40, value: 0.6, layer },
        { label: '0.7', axisTickLabel: '0.7', position: 30, value: 0.7, layer },
        { label: '0.8', axisTickLabel: '0.8', position: 20, value: 0.8, layer },
        { label: '0.9', axisTickLabel: '0.9', position: 10, value: 0.9, layer },
        { label: '1', axisTickLabel: '1', position: 0, value: 1, layer },
      ];
      expect(axisPositions).toEqual(expectedAxisPositions);
    });

    test('should compute positions with rotational offset', () => {
      const rotationalOffset = 2;
      const scale = getScaleForAxisSpec(
        { xDomain, yDomains: [yDomain] },
        { rotation: 0 },
        0,
      )(verticalAxisSpec, [100, 0]);
      const axisPositions = getAvailableTicks(
        verticalAxisSpec,
        scale as Scale<number>,
        0,
        false,
        (v) => `${v}`,
        rotationalOffset,
      );
      const expectedAxisPositions = [
        { label: '0', axisTickLabel: '0', position: 100 + rotationalOffset, value: 0, layer },
        { label: '0.1', axisTickLabel: '0.1', position: 90 + rotationalOffset, value: 0.1, layer },
        { label: '0.2', axisTickLabel: '0.2', position: 80 + rotationalOffset, value: 0.2, layer },
        { label: '0.3', axisTickLabel: '0.3', position: 70 + rotationalOffset, value: 0.3, layer },
        { label: '0.4', axisTickLabel: '0.4', position: 60 + rotationalOffset, value: 0.4, layer },
        { label: '0.5', axisTickLabel: '0.5', position: 50 + rotationalOffset, value: 0.5, layer },
        { label: '0.6', axisTickLabel: '0.6', position: 40 + rotationalOffset, value: 0.6, layer },
        { label: '0.7', axisTickLabel: '0.7', position: 30 + rotationalOffset, value: 0.7, layer },
        { label: '0.8', axisTickLabel: '0.8', position: 20 + rotationalOffset, value: 0.8, layer },
        { label: '0.9', axisTickLabel: '0.9', position: 10 + rotationalOffset, value: 0.9, layer },
        { label: '1', axisTickLabel: '1', position: rotationalOffset, value: 1, layer },
      ];
      expect(axisPositions).toEqual(expectedAxisPositions);
    });

    test('should extend ticks to domain + minInterval in histogram mode for linear scale', () => {
      const enableHistogramMode = true;
      const xBandDomain = MockXDomain.fromScaleType(ScaleType.Linear, {
        domain: [0, 100],
        isBandScale: true,
        minInterval: 10,
      });
      const xScale = getScaleForAxisSpec(
        { xDomain: xBandDomain, yDomains: [yDomain] },
        { rotation: 0 },
        1,
      )(horizontalAxisSpec, [100, 0]);
      const histogramAxisPositions = getAvailableTicks(
        horizontalAxisSpec,
        xScale as Scale<number>,
        1,
        enableHistogramMode,
        (v) => `${v}`,
        0,
      );
      const histogramTickLabels = histogramAxisPositions.map(({ label }: AxisTick) => label);
      expect(histogramTickLabels).toEqual(['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110']);
    });

    test('should extend ticks to domain + minInterval in histogram mode for time scale', () => {
      const enableHistogramMode = true;
      const xBandDomain = MockXDomain.fromScaleType(ScaleType.Time, {
        domain: [1560438420000, 1560438510000],
        isBandScale: true,
        minInterval: 90000,
      });
      const xScale = getScaleForAxisSpec(
        { xDomain: xBandDomain, yDomains: [yDomain] },
        { rotation: 0 },
        1,
      )(horizontalAxisSpec, [100, 0]);
      const histogramAxisPositions = getAvailableTicks(
        horizontalAxisSpec,
        xScale as Scale<number>,
        1,
        enableHistogramMode,
        (v) => `${v}`,
        0,
      );
      const histogramTickValues = histogramAxisPositions.map(({ value }: AxisTick) => value);

      const expectedTickValues = [
        1560438420000,
        1560438435000,
        1560438450000,
        1560438465000,
        1560438480000,
        1560438495000,
        1560438510000,
        1560438525000,
        1560438540000,
        1560438555000,
        1560438570000,
        1560438585000,
        1560438600000,
      ];

      expect(histogramTickValues).toEqual(expectedTickValues);
    });

    test('should extend ticks to domain + minInterval in histogram mode for a scale with single datum', () => {
      const enableHistogramMode = true;
      const xBandDomain = MockXDomain.fromScaleType(ScaleType.Time, {
        domain: [1560438420000, 1560438420000], // a single datum scale will have the same value for domain start & end
        isBandScale: true,
        minInterval: 90000,
      });
      const xScale = getScaleForAxisSpec(
        { xDomain: xBandDomain, yDomains: [yDomain] },
        { rotation: 0 },
        1,
      )(horizontalAxisSpec, [100, 0]);
      const histogramAxisPositions = getAvailableTicks(
        horizontalAxisSpec,
        xScale as Scale<number>,
        1,
        enableHistogramMode,
        (v) => `${v}`,
        0,
      );
      const histogramTickValues = histogramAxisPositions.map(({ value }: AxisTick) => value);
      const expectedTickValues = [1560438420000, 1560438510000];

      expect(histogramTickValues).toEqual(expectedTickValues);
    });
  });
*/
  describe('getVisibleTicks', () => {
    test('should compute visible ticks for a vertical axis', () => {
      /*
      const allTicks = [
        { label: '0', axisTickLabel: '0', position: 100, value: 0, layer },
        { label: '0.1', axisTickLabel: '0.1', position: 90, value: 0.1, layer },
        { label: '0.2', axisTickLabel: '0.2', position: 80, value: 0.2, layer },
        { label: '0.3', axisTickLabel: '0.3', position: 70, value: 0.3, layer },
        { label: '0.4', axisTickLabel: '0.4', position: 60, value: 0.4, layer },
        { label: '0.5', axisTickLabel: '0.5', position: 50, value: 0.5, layer },
        { label: '0.6', axisTickLabel: '0.6', position: 40, value: 0.6, layer },
        { label: '0.7', axisTickLabel: '0.7', position: 30, value: 0.7, layer },
        { label: '0.8', axisTickLabel: '0.8', position: 20, value: 0.8, layer },
        { label: '0.9', axisTickLabel: '0.9', position: 10, value: 0.9, layer },
        { label: '1', axisTickLabel: '1', position: 0, value: 1, layer },
      ];
            const visibleTicks = getVisibleTicks(allTicks, verticalAxisSpec, axis1Dims);
            const expectedVisibleTicks = [
              { label: '1', axisTickLabel: '1', position: 0, value: 1, layer },
              { label: '0.9', axisTickLabel: '0.9', position: 10, value: 0.9, layer },
              { label: '0.8', axisTickLabel: '0.8', position: 20, value: 0.8, layer },
              { label: '0.7', axisTickLabel: '0.7', position: 30, value: 0.7, layer },
              { label: '0.6', axisTickLabel: '0.6', position: 40, value: 0.6, layer },
              { label: '0.5', axisTickLabel: '0.5', position: 50, value: 0.5, layer },
              { label: '0.4', axisTickLabel: '0.4', position: 60, value: 0.4, layer },
              { label: '0.3', axisTickLabel: '0.3', position: 70, value: 0.3, layer },
              { label: '0.2', axisTickLabel: '0.2', position: 80, value: 0.2, layer },
              { label: '0.1', axisTickLabel: '0.1', position: 90, value: 0.1, layer },
              { label: '0', axisTickLabel: '0', position: 100, value: 0, layer },
            ];
            expect(visibleTicks).toIncludeSameMembers(expectedVisibleTicks);
      */
    });
    test('should compute visible ticks for a horizontal axis', () => {
      /* const allTicks = [
       { label: '0', axisTickLabel: '0', position: 100, value: 0, layer },
       { label: '0.1', axisTickLabel: '0.1', position: 90, value: 0.1, layer },
       { label: '0.2', axisTickLabel: '0.2', position: 80, value: 0.2, layer },
       { label: '0.3', axisTickLabel: '0.3', position: 70, value: 0.3, layer },
       { label: '0.4', axisTickLabel: '0.4', position: 60, value: 0.4, layer },
       { label: '0.5', axisTickLabel: '0.5', position: 50, value: 0.5, layer },
       { label: '0.6', axisTickLabel: '0.6', position: 40, value: 0.6, layer },
       { label: '0.7', axisTickLabel: '0.7', position: 30, value: 0.7, layer },
       { label: '0.8', axisTickLabel: '0.8', position: 20, value: 0.8, layer },
       { label: '0.9', axisTickLabel: '0.9', position: 10, value: 0.9, layer },
       { label: '1', axisTickLabel: '1', position: 0, value: 1, layer },
     ];

           const visibleTicks = getVisibleTicks(allTicks, horizontalAxisSpec, axis1Dims);
           const expectedVisibleTicks = [
             { label: '1', axisTickLabel: '1', position: 0, value: 1, layer },
             { label: '0.9', axisTickLabel: '0.9', position: 10, value: 0.9, layer },
             { label: '0.8', axisTickLabel: '0.8', position: 20, value: 0.8, layer },
             { label: '0.7', axisTickLabel: '0.7', position: 30, value: 0.7, layer },
             { label: '0.6', axisTickLabel: '0.6', position: 40, value: 0.6, layer },
             { label: '0.5', axisTickLabel: '0.5', position: 50, value: 0.5, layer },
             { label: '0.4', axisTickLabel: '0.4', position: 60, value: 0.4, layer },
             { label: '0.3', axisTickLabel: '0.3', position: 70, value: 0.3, layer },
             { label: '0.2', axisTickLabel: '0.2', position: 80, value: 0.2, layer },
             { label: '0.1', axisTickLabel: '0.1', position: 90, value: 0.1, layer },
             { label: '0', axisTickLabel: '0', position: 100, value: 0, layer },
           ];
           expect(visibleTicks).toIncludeSameMembers(expectedVisibleTicks);
     */
    });
    test('should hide some ticks', () => {
      /*  const allTicks = [
    { label: '0', axisTickLabel: '0', position: 100, value: 0, layer },
    { label: '0.1', axisTickLabel: '0.1', position: 90, value: 0.1, layer },
    { label: '0.2', axisTickLabel: '0.2', position: 80, value: 0.2, layer },
    { label: '0.3', axisTickLabel: '0.3', position: 70, value: 0.3, layer },
    { label: '0.4', axisTickLabel: '0.4', position: 60, value: 0.4, layer },
    { label: '0.5', axisTickLabel: '0.5', position: 50, value: 0.5, layer },
    { label: '0.6', axisTickLabel: '0.6', position: 40, value: 0.6, layer },
    { label: '0.7', axisTickLabel: '0.7', position: 30, value: 0.7, layer },
    { label: '0.8', axisTickLabel: '0.8', position: 20, value: 0.8, layer },
    { label: '0.9', axisTickLabel: '0.9', position: 10, value: 0.9, layer },
    { label: '1', axisTickLabel: '1', position: 0, value: 1, layer },
  ];
  const axis2Dims = {
    axisScaleType: ScaleType.Linear,
    axisScaleDomain: [0, 1],
    maxLabelBboxWidth: 10,
    maxLabelBboxHeight: 20,
    maxLabelTextWidth: 10,
    maxLabelTextHeight: 20,
    isHidden: false,
  };

        const visibleTicks = getVisibleTicks(allTicks, verticalAxisSpec, axis2Dims);
        const expectedVisibleTicks = [
          { label: '1', axisTickLabel: '1', position: 0, value: 1, layer },
          { label: '0.8', axisTickLabel: '0.8', position: 20, value: 0.8, layer },
          { label: '0.6', axisTickLabel: '0.6', position: 40, value: 0.6, layer },
          { label: '0.4', axisTickLabel: '0.4', position: 60, value: 0.4, layer },
          { label: '0.2', axisTickLabel: '0.2', position: 80, value: 0.2, layer },
          { label: '0', axisTickLabel: '0', position: 100, value: 0, layer },
        ];
        expect(visibleTicks).toIncludeSameMembers(expectedVisibleTicks);
  */
    });
    test('should show all overlapping ticks and labels if configured to', () => {
      /*  const allTicks = [
        { label: '0', axisTickLabel: '0', position: 100, value: 0, layer },
        { label: '0.1', axisTickLabel: '0.1', position: 90, value: 0.1, layer },
        { label: '0.2', axisTickLabel: '0.2', position: 80, value: 0.2, layer },
        { label: '0.3', axisTickLabel: '0.3', position: 70, value: 0.3, layer },
        { label: '0.4', axisTickLabel: '0.4', position: 60, value: 0.4, layer },
        { label: '0.5', axisTickLabel: '0.5', position: 50, value: 0.5, layer },
        { label: '0.6', axisTickLabel: '0.6', position: 40, value: 0.6, layer },
        { label: '0.7', axisTickLabel: '0.7', position: 30, value: 0.7, layer },
        { label: '0.8', axisTickLabel: '0.8', position: 20, value: 0.8, layer },
        { label: '0.9', axisTickLabel: '0.9', position: 10, value: 0.9, layer },
        { label: '1', axisTickLabel: '1', position: 0, value: 1, layer },
      ];
      const axis2Dims = {
        axisScaleType: ScaleType.Linear,
        axisScaleDomain: [0, 1],
        maxLabelBboxWidth: 10,
        maxLabelBboxHeight: 20,
        maxLabelTextWidth: 10,
        maxLabelTextHeight: 20,
        isHidden: false,
      };

      verticalAxisSpec.showOverlappingTicks = true;
      verticalAxisSpec.showOverlappingLabels = true;

      const visibleOverlappingTicks = getVisibleTicks(allTicks, verticalAxisSpec, axis2Dims);
      const expectedVisibleOverlappingTicks = [
        { label: '1', axisTickLabel: '1', position: 0, value: 1, layer },
        { label: '0.9', axisTickLabel: '0.9', position: 10, value: 0.9, layer },
        { label: '0.8', axisTickLabel: '0.8', position: 20, value: 0.8, layer },
        { label: '0.7', axisTickLabel: '0.7', position: 30, value: 0.7, layer },
        { label: '0.6', axisTickLabel: '0.6', position: 40, value: 0.6, layer },
        { label: '0.5', axisTickLabel: '0.5', position: 50, value: 0.5, layer },
        { label: '0.4', axisTickLabel: '0.4', position: 60, value: 0.4, layer },
        { label: '0.3', axisTickLabel: '0.3', position: 70, value: 0.3, layer },
        { label: '0.2', axisTickLabel: '0.2', position: 80, value: 0.2, layer },
        { label: '0.1', axisTickLabel: '0.1', position: 90, value: 0.1, layer },
        { label: '0', axisTickLabel: '0', position: 100, value: 0, layer },
      ];
      expect(visibleOverlappingTicks).toIncludeSameMembers(expectedVisibleOverlappingTicks);
*/

      verticalAxisSpec.showOverlappingTicks = true;
      verticalAxisSpec.showOverlappingLabels = false;
      /*
      const visibleOverlappingTicksAndLabels = getVisibleTicks(allTicks, verticalAxisSpec, axis2Dims);
      const expectedVisibleOverlappingTicksAndLabels = [
        { label: '1', axisTickLabel: '1', position: 0, value: 1, layer },
        { label: '0.9', axisTickLabel: '', position: 10, value: 0.9, layer },
        { label: '0.8', axisTickLabel: '0.8', position: 20, value: 0.8, layer },
        { label: '0.7', axisTickLabel: '', position: 30, value: 0.7, layer },
        { label: '0.6', axisTickLabel: '0.6', position: 40, value: 0.6, layer },
        { label: '0.5', axisTickLabel: '', position: 50, value: 0.5, layer },
        { label: '0.4', axisTickLabel: '0.4', position: 60, value: 0.4, layer },
        { label: '0.3', axisTickLabel: '', position: 70, value: 0.3, layer },
        { label: '0.2', axisTickLabel: '0.2', position: 80, value: 0.2, layer },
        { label: '0.1', axisTickLabel: '', position: 90, value: 0.1, layer },
        { label: '0', axisTickLabel: '0', position: 100, value: 0, layer },
      ];
      expect(visibleOverlappingTicksAndLabels).toIncludeSameMembers(expectedVisibleOverlappingTicksAndLabels);
*/
    });
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

  /*
    test('should compute axis ticks positions with title', () => {
      // validate assumptions for test
      expect(verticalAxisSpec.id).toEqual(verticalAxisSpecWTitle.id);

      const axisSpecs = new Map([['myId', verticalAxisSpecWTitle]]);
      const axesStyles = new Map();
      const axisDims = new Map();
      axisDims.set(verticalAxisSpecWTitle.id, axis1Dims);

      let axisTicksPosition = getAxesGeometries(
        {
          chartDimensions: chartDim,
          leftMargin: 0,
        },
        LIGHT_THEME,
        { rotation: NO_ROTATION },
        axisSpecs,
        axisDims,
        axesStyles,
        { xDomain, yDomains: [yDomain] },
        emptySmScales,
        1,
        false,
        (v) => `${v}`,
      );

      const verticalAxisGeoms = axisTicksPosition.find(({ axis: { id } }) => id === verticalAxisSpecWTitle.id);
      expect(verticalAxisGeoms?.anchorPoint).toEqual({
        y: 0,
        x: 10,
      });
      expect(verticalAxisGeoms?.size).toEqual({
        width: 50,
        height: 100,
      });

      axisSpecs[0] = verticalAxisSpec;

      axisDims.set(verticalAxisSpec.id, axis1Dims);

      axisTicksPosition = getAxesGeometries(
        {
          chartDimensions: chartDim,
          leftMargin: 0,
        },
        LIGHT_THEME,
        { rotation: NO_ROTATION },
        axisSpecs,
        axisDims,
        axesStyles,
        { xDomain, yDomains: [yDomain] },
        emptySmScales,
        1,
        false,
        (v) => `${v}`,
      );
      const verticalAxisSpecWTitleGeoms = axisTicksPosition.find(({ axis: { id } }) => id === verticalAxisSpecWTitle.id);
      expect(verticalAxisSpecWTitleGeoms?.anchorPoint).toEqual({
        y: 0,
        x: 10,
      });
      expect(verticalAxisSpecWTitleGeoms?.size).toEqual({
        width: 50,
        height: 100,
      });
    });
  */

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

  /*
    test('should not compute axis ticks positions if misaligned specs', () => {
      const axisSpecs = [verticalAxisSpec];
      const axisStyles = new Map();
      const axisDims: AxesTicksDimensions = new Map();
      axisDims.set('not_a_mapped_one', axis1Dims);

      const axisTicksPosition = getAxesGeometries(
        {
          chartDimensions: chartDim,
          leftMargin: 0,
        },
        LIGHT_THEME,
        { rotation: NO_ROTATION },
        axisSpecs,
        axisDims,
        axisStyles,
        { xDomain, yDomains: [yDomain] },
        emptySmScales,
        1,
        false,
        (v) => `${v}`,
      );
      expect(axisTicksPosition).toHaveLength(0);
      // expect(axisTicksPosition.axisTicks.size).toBe(0);
      // expect(axisTicksPosition.axisGridLinesPositions.size).toBe(0);
      // expect(axisTicksPosition.axisVisibleTicks.size).toBe(0);
    });
  */

  /*
    test('should compute axis ticks positions', () => {
      const store = MockStore.default();
      MockStore.addSpecs(
        [
          MockGlobalSpec.settingsNoMargins(),
          lineSeriesSpec,
          MockGlobalSpec.yAxis({
            ...verticalAxisSpec,
            hide: true,
            gridLine: {
              visible: true,
            },
          }),
        ],
        store,
      );
      const gridLines = getGridLinesSelector(store.getState());

      const expectedVerticalAxisGridLines = [
        [0, 0, 100, 0],
        [0, 10, 100, 10],
        [0, 20, 100, 20],
        [0, 30, 100, 30],
        [0, 40, 100, 40],
        [0, 50, 100, 50],
        [0, 60, 100, 60],
        [0, 70, 100, 70],
        [0, 80, 100, 80],
        [0, 90, 100, 90],
        [0, 100, 100, 100],
      ];

      const [{ lines }] = gridLines[0].lineGroups;

      expect(lines.map(({ x1, y1, x2, y2 }) => [x1, y1, x2, y2])).toIncludeSameMembers(expectedVerticalAxisGridLines);

      const axisTicksPositionWithTopLegend = computeAxesGeometriesSelector(store.getState());

      const verticalAxisWithTopLegendPosition = axisTicksPositionWithTopLegend.find(
        ({ axis: { id } }) => id === verticalAxisSpec.id,
      );
      // TODO check the root cause of having with at 10 on previous implementation
      expect(verticalAxisWithTopLegendPosition?.size).toEqual({ height: 0, width: 0 });
      expect(verticalAxisWithTopLegendPosition?.anchorPoint).toEqual({ x: 100, y: 0 });

      const ungroupedAxisSpec = { ...verticalAxisSpec, groupId: 'foo' };
      const invalidSpecs = [ungroupedAxisSpec];
      const computeScalelessSpec = () => {
        const axisDims = computeAxisTicksDimensionsSelector(store.getState());
        const axisStyles = getAxesStylesSelector(store.getState());
        getAxesGeometries(
          {
            chartDimensions: chartDim,
            leftMargin: 0,
          },
          LIGHT_THEME,
          { rotation: NO_ROTATION },
          invalidSpecs,
          axisDims,
          axisStyles,
          { xDomain, yDomains: [yDomain] },
          emptySmScales,
          1,
          false,
          (v) => `${v}`,
        );
      };

      expect(computeScalelessSpec).toThrow('Cannot compute scale for axis spec axis_1');
    });
  */

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
        { chartType: 'xy_axis', timeAxisLayerCount: 2, position: 'bottom' } as unknown as AxisSpec,
        'time',
        0,
      );
      expect(multilayerTimeAxis).toBe(true);
    });

    test('should return false if x axis type is not time', () => {
      const multilayerTimeAxis = isMultilayerTimeAxis(
        { chartType: 'xy_axis', timeAxisLayerCount: 2, position: 'bottom' } as unknown as AxisSpec,
        'ordinal',
        0,
      );
      expect(multilayerTimeAxis).toBe(false);
    });

    test('should return false timeAxisLayerCount = 0', () => {
      const multilayerTimeAxis = isMultilayerTimeAxis(
        { chartType: 'xy_axis', timeAxisLayerCount: 0, position: 'bottom' } as unknown as AxisSpec,
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
        { chartType: 'xy_axis', timeAxisLayerCount: 2, position: 'bottom' } as unknown as AxisSpec,
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

  test.skip('should show unique tick labels if duplicateTicks is set to false', () => {
    const now = DateTime.fromISO('2019-01-11T00:00:00.000').setZone('utc+1').toMillis();
    const oneDay = moment.duration(1, 'day');
    const formatter = niceTimeFormatter([now, oneDay.add(now).asMilliseconds() * 31]);
    const axisSpec: AxisSpec = {
      id: 'bottom',
      position: 'bottom',
      showDuplicatedTicks: false,
      chartType: 'xy_axis',
      specType: 'axis',
      groupId: DEFAULT_GLOBAL_ID,
      hide: false,
      showOverlappingLabels: false,
      showOverlappingTicks: false,
      style,
      tickFormat: formatter,
      timeAxisLayerCount: 0,
    };
    const xDomainTime = MockXDomain.fromScaleType(ScaleType.Time, {
      isBandScale: false,
      domain: [1547190000000, 1547622000000],
      minInterval: 86400000,
    });
    const scale = computeXScale({
      xDomain: xDomainTime,
      totalBarsInCluster: 0,
      range: [0, 603.5],
    });
    const offset = 0;
    const tickFormatOption = { timeZone: 'utc+1' };
    expect(
      generateTicks(
        axisSpec,
        scale,
        scale.ticks(),
        offset,
        (v: any) => formatter(v, tickFormatOption),
        0,
        0,
        true,
        false,
      ),
    ).toEqual([
      { value: 1547208000000, label: '2019-01-11', position: 25.145833333333332, layer },
      { value: 1547251200000, label: '2019-01-12', position: 85.49583333333334, layer },
      { value: 1547337600000, label: '2019-01-13', position: 206.19583333333333, layer },
      { value: 1547424000000, label: '2019-01-14', position: 326.8958333333333, layer },
      { value: 1547510400000, label: '2019-01-15', position: 447.59583333333336, layer },
      { value: 1547596800000, label: '2019-01-16', position: 568.2958333333333, layer },
    ]);
  });
  test('should show unique consecutive ticks if duplicateTicks is set to false', () => {
    const tickFormat: TickFormatter = (d, options) =>
      DateTime.fromMillis(d, { setZone: true, zone: options?.timeZone ?? 'utc+1' }).toFormat('HH:mm');
    const axisSpec: AxisSpec = {
      id: 'bottom',
      position: 'bottom',
      showDuplicatedTicks: false,
      chartType: 'xy_axis',
      specType: 'axis',
      groupId: DEFAULT_GLOBAL_ID,
      hide: false,
      showOverlappingLabels: false,
      showOverlappingTicks: false,
      style,
      tickFormat,
      timeAxisLayerCount: 3,
    };
    const xDomainTime = MockXDomain.fromScaleType(ScaleType.Time, {
      isBandScale: false,
      timeZone: 'utc+1',
      domain: [1547190000000, 1547622000000],
      minInterval: 86400000,
    });
    const scale = computeXScale({
      xDomain: xDomainTime,
      totalBarsInCluster: 0,
      range: [0, 603.5],
    });
    const offset = 0;
    const ticks = generateTicks(
      axisSpec,
      scale,
      scale.ticks(),
      offset,
      (d) => tickFormat(d, { timeZone: xDomainTime.timeZone }),
      0,
      0,
      true,
      false,
    );
    const tickLabels = ticks.map(({ label }) => ({ label }));
    expect(tickLabels).toEqual([
      { label: '12:00' },
      { label: '00:00' },
      { label: '12:00' },
      { label: '00:00' },
      { label: '12:00' },
      { label: '00:00' },
      { label: '12:00' },
      { label: '00:00' },
      { label: '12:00' },
      { label: '00:00' },
    ]);
  });
  test('should show duplicate tick labels if duplicateTicks is set to true', () => {
    const now = DateTime.fromISO('2019-01-11T00:00:00.000').setZone('utc+1').toMillis();
    const oneDay = moment.duration(1, 'day');
    const tickFormat = niceTimeFormatter([now, oneDay.add(now).asMilliseconds() * 31]);
    const axisSpec: AxisSpec = {
      id: 'bottom',
      position: 'bottom',
      showDuplicatedTicks: true,
      chartType: 'xy_axis',
      specType: 'axis',
      groupId: DEFAULT_GLOBAL_ID,
      hide: false,
      showOverlappingLabels: false,
      showOverlappingTicks: false,
      style,
      tickFormat,
      timeAxisLayerCount: 3,
    };
    const xDomainTime = MockXDomain.fromScaleType(ScaleType.Time, {
      isBandScale: false,
      domain: [1547190000000, 1547622000000],
      minInterval: 86400000,
      timeZone: 'utc',
    });
    const scale = computeXScale({
      xDomain: xDomainTime,
      totalBarsInCluster: 0,
      range: [0, 603.5],
    });
    const offset = 0;
    const tickFormatOption = { timeZone: 'utc+1' };
    expect(
      generateTicks(axisSpec, scale, scale.ticks(), offset, (v) => tickFormat(v, tickFormatOption), 0, 0, true, false),
    ).toEqual([
      {
        value: 1547208000000,
        domainClampedValue: 1547208000000,
        label: '2019-01-11',
        position: 25.145833333333332,
        domainClampedPosition: 25.145833333333332,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547251200000,
        domainClampedValue: 1547251200000,
        label: '2019-01-12',
        position: 85.49583333333334,
        domainClampedPosition: 85.49583333333334,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547294400000,
        domainClampedValue: 1547294400000,
        label: '2019-01-12',
        position: 145.84583333333333,
        domainClampedPosition: 145.84583333333333,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547337600000,
        domainClampedValue: 1547337600000,
        label: '2019-01-13',
        position: 206.19583333333333,
        domainClampedPosition: 206.19583333333333,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547380800000,
        domainClampedValue: 1547380800000,
        label: '2019-01-13',
        position: 266.54583333333335,
        domainClampedPosition: 266.54583333333335,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547424000000,
        domainClampedValue: 1547424000000,
        label: '2019-01-14',
        position: 326.8958333333333,
        domainClampedPosition: 326.8958333333333,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547467200000,
        domainClampedValue: 1547467200000,
        label: '2019-01-14',
        position: 387.24583333333334,
        domainClampedPosition: 387.24583333333334,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547510400000,
        domainClampedValue: 1547510400000,
        label: '2019-01-15',
        position: 447.59583333333336,
        domainClampedPosition: 447.59583333333336,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547553600000,
        domainClampedValue: 1547553600000,
        label: '2019-01-15',
        position: 507.9458333333333,
        domainClampedPosition: 507.9458333333333,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547596800000,
        domainClampedValue: 1547596800000,
        label: '2019-01-16',
        position: 568.2958333333333,
        domainClampedPosition: 568.2958333333333,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
    ]);
  });
  test('should use custom tick formatter', () => {
    const now = DateTime.fromISO('2019-01-11T00:00:00.000').setZone('utc+1').toMillis();
    const oneDay = moment.duration(1, 'day');
    const tickFormat = niceTimeFormatter([now, oneDay.add(now).asMilliseconds() * 31]);
    const axisSpec: AxisSpec = {
      id: 'bottom',
      position: 'bottom',
      showDuplicatedTicks: true,
      chartType: 'xy_axis',
      specType: 'axis',
      groupId: DEFAULT_GLOBAL_ID,
      hide: false,
      showOverlappingLabels: false,
      showOverlappingTicks: false,
      style,
      tickFormat,
      timeAxisLayerCount: 3,
    };
    const xDomainTime = MockXDomain.fromScaleType(ScaleType.Time, {
      isBandScale: false,
      domain: [1547190000000, 1547622000000],
      minInterval: 86400000,
      timeZone: 'utc',
    });
    const scale = computeXScale({ xDomain: xDomainTime, totalBarsInCluster: 0, range: [0, 603.5] });
    const offset = 0;
    const tickFormatOption = { timeZone: 'utc+1' };
    expect(
      generateTicks(axisSpec, scale, scale.ticks(), offset, (v) => tickFormat(v, tickFormatOption), 0, 0, true, false),
    ).toEqual([
      {
        value: 1547208000000,
        domainClampedValue: 1547208000000,
        label: '2019-01-11',
        position: 25.145833333333332,
        domainClampedPosition: 25.145833333333332,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547251200000,
        domainClampedValue: 1547251200000,
        label: '2019-01-12',
        position: 85.49583333333334,
        domainClampedPosition: 85.49583333333334,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547294400000,
        domainClampedValue: 1547294400000,
        label: '2019-01-12',
        position: 145.84583333333333,
        domainClampedPosition: 145.84583333333333,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547337600000,
        domainClampedValue: 1547337600000,
        label: '2019-01-13',
        position: 206.19583333333333,
        domainClampedPosition: 206.19583333333333,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547380800000,
        domainClampedValue: 1547380800000,
        label: '2019-01-13',
        position: 266.54583333333335,
        domainClampedPosition: 266.54583333333335,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547424000000,
        domainClampedValue: 1547424000000,
        label: '2019-01-14',
        position: 326.8958333333333,
        domainClampedPosition: 326.8958333333333,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547467200000,
        domainClampedValue: 1547467200000,
        label: '2019-01-14',
        position: 387.24583333333334,
        domainClampedPosition: 387.24583333333334,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547510400000,
        domainClampedValue: 1547510400000,
        label: '2019-01-15',
        position: 447.59583333333336,
        domainClampedPosition: 447.59583333333336,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547553600000,
        domainClampedValue: 1547553600000,
        label: '2019-01-15',
        position: 507.9458333333333,
        domainClampedPosition: 507.9458333333333,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
      {
        value: 1547596800000,
        domainClampedValue: 1547596800000,
        label: '2019-01-16',
        position: 568.2958333333333,
        domainClampedPosition: 568.2958333333333,
        layer,
        multilayerTimeAxis: false,
        detailedLayer,
        direction: 'ltr',
        showGrid: true,
      },
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
