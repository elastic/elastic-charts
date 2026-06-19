/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisLayoutContext } from './dimensions';
import { getAxisBand, measureAxisFixedBand } from './dimensions';
import { getAxesGeometries } from './geometry';
import type { TickLabelBox } from './ticks/labels';
import type { AxisTick, Projection } from './ticks/types';
import type { SmallMultipleScales } from '../../../common/panel_utils';
import { MockGlobalSpec } from '../../../mocks/specs/specs';
import { ScaleBand } from '../../../scales';
import { getSmallMultiplesScale } from '../../../state/utils/get_small_multiples_scale';
import { Position } from '../../../utils/common';
import type { Dimensions } from '../../../utils/dimensions';
import type { AxisId } from '../../../utils/ids';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import type { AxisStyle, Theme } from '../../../utils/themes/theme';
import type { JoinedAxisData } from '../state/selectors/compute_baseline_axes';
import type { AxisSpec } from '../utils/specs';

const AXIS_STYLE = LIGHT_THEME.axes;
const TICK_LABEL_FIXED_BAND = measureAxisFixedBand({ title: undefined, hide: false }, AXIS_STYLE);

const CHART_DIMENSIONS: Dimensions = { top: 10, left: 20, width: 100, height: 80 };
const CHART_MARGINS = { top: 1, bottom: 2, left: 3, right: 4 };
const THEME: Theme = {
  ...LIGHT_THEME,
  chartMargins: CHART_MARGINS,
  chartPaddings: { top: 0, bottom: 0, left: 0, right: 0 },
};

// Single-panel small multiples scales: bandwidth equals the full container so panel size equals chart size.
const SM_SCALES: SmallMultipleScales = {
  horizontal: getSmallMultiplesScale([0], CHART_DIMENSIONS.width),
  vertical: getSmallMultiplesScale([0], CHART_DIMENSIONS.height),
};

const tickBox = (overrides: Partial<TickLabelBox> = {}): TickLabelBox => ({
  width: 0,
  height: 0,
  bboxWidth: 0,
  bboxHeight: 0,
  lines: Object.assign([] as string[], { meta: { truncated: false } }),
  ...overrides,
});

const makeTick = (layout: TickLabelBox): AxisTick => ({
  value: 0,
  domainClampedValue: 0,
  label: '',
  position: 0,
  domainClampedPosition: 0,
  detailedLayer: 0,
  showGrid: false,
  direction: 'ltr',
  multilayerTimeAxis: false,
  layout,
});

const layoutFor = (position: Position, style: AxisStyle = AXIS_STYLE): AxisLayoutContext => ({
  band: getAxisBand(position, style, TICK_LABEL_FIXED_BAND, CHART_DIMENSIONS.width, CHART_DIMENSIONS.height),
  multilayerTimeAxis: false,
});

const placeholderScale = new ScaleBand([0], [0, 1]);

const makeJoined = (axisSpec: AxisSpec, layout: AxisLayoutContext): JoinedAxisData => ({
  axisSpec,
  axesStyle: AXIS_STYLE,
  layout,
  scale: placeholderScale,
  gridLine: AXIS_STYLE.gridLine.vertical,
  isXAxis: !axisSpec.position || axisSpec.position === Position.Bottom || axisSpec.position === Position.Top,
  labelFormatter: (value) => String(value),
});

const buildInputs = (axes: Array<{ id: AxisId; spec: AxisSpec; ticks: TickLabelBox[]; layout: AxisLayoutContext }>) => {
  const joined = new Map<AxisId, JoinedAxisData>();
  const projections = new Map<AxisId, Projection>();
  axes.forEach(({ id, spec, ticks, layout }) => {
    joined.set(id, makeJoined(spec, layout));
    projections.set(id, { ticks: ticks.map(makeTick), scale: placeholderScale });
  });
  return { joined, projections };
};

describe('getAxesGeometries', () => {
  const chartDims = { chartDimensions: CHART_DIMENSIONS, leftMargin: 0 };

  test('returns an empty array when no axes are visible', () => {
    expect(getAxesGeometries(chartDims, THEME, new Map(), SM_SCALES, new Map())).toEqual([]);
  });

  test('places a left axis flush against the left chart edge with width = fixed band + max label bboxWidth', () => {
    const labelBboxWidth = 30;
    const ticks = [tickBox({ bboxWidth: labelBboxWidth })];
    const expectedBandWidth = TICK_LABEL_FIXED_BAND + labelBboxWidth;

    const spec = MockGlobalSpec.yAxis({ id: 'y', position: Position.Left, title: undefined });
    const { joined, projections } = buildInputs([{ id: 'y', spec, ticks, layout: layoutFor(Position.Left) }]);

    const geoms = getAxesGeometries(chartDims, THEME, joined, SM_SCALES, projections);

    expect(geoms.length).toBeGreaterThan(0);

    const geom = geoms[0]!;

    expect(geom.axis).toMatchObject({ id: 'y', position: Position.Left });
    expect(geom.anchorPoint).toEqual({ x: CHART_MARGINS.left, y: CHART_DIMENSIONS.top });
    expect(geom.parentSize).toEqual({ width: expectedBandWidth, height: CHART_DIMENSIONS.height });
    expect(geom.size).toEqual({ width: expectedBandWidth, height: CHART_DIMENSIONS.height });
    expect(geom.dimension.bboxWidth).toBe(labelBboxWidth);
  });

  test('places a right axis past the right chart edge', () => {
    const labelBboxWidth = 30;
    const ticks = [tickBox({ bboxWidth: labelBboxWidth })];
    const expectedBandWidth = TICK_LABEL_FIXED_BAND + labelBboxWidth;

    const spec = MockGlobalSpec.yAxis({ id: 'y', position: Position.Right, title: undefined });
    const { joined, projections } = buildInputs([{ id: 'y', spec, ticks, layout: layoutFor(Position.Right) }]);

    const geoms = getAxesGeometries(chartDims, THEME, joined, SM_SCALES, projections);
    expect(geoms.length).toBeGreaterThan(0);
    const geom = geoms[0]!;

    expect(geom.anchorPoint).toEqual({
      x: CHART_DIMENSIONS.left + CHART_DIMENSIONS.width,
      y: CHART_DIMENSIONS.top,
    });
    expect(geom.parentSize).toEqual({ width: expectedBandWidth, height: CHART_DIMENSIONS.height });
  });

  test('places a top axis above the chart and uses bboxHeight to size the band', () => {
    const labelBboxHeight = 12;
    const ticks = [tickBox({ bboxHeight: labelBboxHeight })];
    const expectedBandHeight = TICK_LABEL_FIXED_BAND + labelBboxHeight;

    const spec = MockGlobalSpec.xAxis({ id: 'x', position: Position.Top, title: undefined });
    const { joined, projections } = buildInputs([{ id: 'x', spec, ticks, layout: layoutFor(Position.Top) }]);

    const geoms = getAxesGeometries(chartDims, THEME, joined, SM_SCALES, projections);
    expect(geoms.length).toBeGreaterThan(0);
    const geom = geoms[0]!;

    expect(geom.anchorPoint).toEqual({ x: CHART_DIMENSIONS.left, y: CHART_MARGINS.top });
    expect(geom.parentSize).toEqual({ width: CHART_DIMENSIONS.width, height: expectedBandHeight });
    expect(geom.size).toEqual({ width: CHART_DIMENSIONS.width, height: expectedBandHeight });
  });

  test('places a bottom axis below the chart', () => {
    const labelBboxHeight = 12;
    const ticks = [tickBox({ bboxHeight: labelBboxHeight })];
    const expectedBandHeight = TICK_LABEL_FIXED_BAND + labelBboxHeight;

    const spec = MockGlobalSpec.xAxis({ id: 'x', position: Position.Bottom, title: undefined });
    const { joined, projections } = buildInputs([{ id: 'x', spec, ticks, layout: layoutFor(Position.Bottom) }]);

    const geoms = getAxesGeometries(chartDims, THEME, joined, SM_SCALES, projections);
    expect(geoms.length).toBeGreaterThan(0);
    const geom = geoms[0]!;

    expect(geom.anchorPoint).toEqual({
      x: CHART_DIMENSIONS.left,
      y: CHART_DIMENSIONS.top + CHART_DIMENSIONS.height,
    });
    expect(geom.parentSize).toEqual({ width: CHART_DIMENSIONS.width, height: expectedBandHeight });
  });

  test('stacks two axes on the same side using cumulative offsets', () => {
    const innerLabelWidth = 30;
    const outerLabelWidth = 20;
    const innerBand = TICK_LABEL_FIXED_BAND + innerLabelWidth;
    const outerBand = TICK_LABEL_FIXED_BAND + outerLabelWidth;

    const inner = MockGlobalSpec.yAxis({ id: 'inner', position: Position.Left, title: undefined });
    const outer = MockGlobalSpec.yAxis({ id: 'outer', position: Position.Left, title: undefined });
    const { joined, projections } = buildInputs([
      {
        id: 'inner',
        spec: inner,
        ticks: [tickBox({ bboxWidth: innerLabelWidth })],
        layout: layoutFor(Position.Left),
      },
      {
        id: 'outer',
        spec: outer,
        ticks: [tickBox({ bboxWidth: outerLabelWidth })],
        layout: layoutFor(Position.Left),
      },
    ]);

    const geoms = getAxesGeometries(chartDims, THEME, joined, SM_SCALES, projections);

    expect(geoms.map((g) => g.axis.id)).toEqual(['inner', 'outer']);

    const innerGeom = geoms[0]!;
    const outerGeom = geoms[1]!;

    expect(innerGeom.anchorPoint.x).toBe(CHART_MARGINS.left);
    // Second axis is offset by the first axis band + its left chart margin.
    expect(outerGeom.anchorPoint.x).toBe(CHART_MARGINS.left + innerBand + CHART_MARGINS.left);
    expect(innerGeom.parentSize.width).toBe(innerBand);
    expect(outerGeom.parentSize.width).toBe(outerBand);
  });

  test('hidden axes collapse size.width/height to zero but preserve parentSize', () => {
    const labelBboxWidth = 30;
    const ticks = [tickBox({ bboxWidth: labelBboxWidth })];
    const expectedBandWidth = TICK_LABEL_FIXED_BAND + labelBboxWidth;

    const spec = MockGlobalSpec.yAxis({ id: 'y', position: Position.Left, title: undefined, hide: true });
    const { joined, projections } = buildInputs([{ id: 'y', spec, ticks, layout: layoutFor(Position.Left) }]);

    const geoms = getAxesGeometries(chartDims, THEME, joined, SM_SCALES, projections);
    expect(geoms.length).toBeGreaterThan(0);
    const geom = geoms[0]!;

    expect(geom.size).toEqual({ width: 0, height: 0 });
    expect(geom.parentSize).toEqual({ width: expectedBandWidth, height: CHART_DIMENSIONS.height });
  });
});
