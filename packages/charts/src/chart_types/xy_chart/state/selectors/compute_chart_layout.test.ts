/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartLayoutSelector } from './compute_chart_layout';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { Position } from '../../../../utils/common';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { getAxesDimensions, getAxisBand, measureAxisFixedBand } from '../../axes/dimensions';

const AXIS_STYLE = LIGHT_THEME.axes;

const MIN_EXTENT = 60;
const MAX_EXTENT = 25;

const data = [
  { x: 'a', y: 1 },
  { x: 'b', y: 2 },
];

const createMockCanvasContext = (): CanvasRenderingContext2D =>
  ({
    save: jest.fn(),
    restore: jest.fn(),
    measureText: (text: string) => ({ width: text.length * 8 }),
    font: '',
  }) as unknown as CanvasRenderingContext2D;

const checkIfLayoutConverged = (
  container: { width: number; height: number },
  specs: Array<ReturnType<typeof MockGlobalSpec.xAxis>>,
  dimensions: ReturnType<typeof computeChartLayoutSelector>['dimensions'],
  ticks: ReturnType<typeof computeChartLayoutSelector>['ticks'],
) => {
  const themeNoMargins = { ...LIGHT_THEME, chartMargins: { top: 0, bottom: 0, left: 0, right: 0 } };
  const remeasured = getAxesDimensions(
    themeNoMargins,
    specs.map((spec) => {
      const projection = ticks.get(spec.id);
      const fixedBand = measureAxisFixedBand(spec, AXIS_STYLE);
      return {
        spec,
        style: AXIS_STYLE,
        layouts: projection?.ticks.map((tick) => tick.layout) ?? [],
        ticks: projection?.ticks,
        layout: {
          band: getAxisBand(spec.position, AXIS_STYLE, fixedBand, container.width, container.height),
          multilayerTimeAxis: false,
        },
        scale: projection?.scale,
        isHidden: false,
      };
    }),
  );
  const impliedMargins = {
    top: dimensions.chartDimensions.top,
    left: dimensions.chartDimensions.left,
    right: container.width - dimensions.chartDimensions.left - dimensions.chartDimensions.width,
    bottom: container.height - dimensions.chartDimensions.top - dimensions.chartDimensions.height,
  };
  expect(remeasured.top).toBeCloseTo(impliedMargins.top, 0);
  expect(remeasured.bottom).toBeCloseTo(impliedMargins.bottom, 0);
  expect(remeasured.left).toBeCloseTo(impliedMargins.left, 0);
  expect(remeasured.right).toBeCloseTo(impliedMargins.right, 0);
};

describe('computeChartLayoutSelector', () => {
  let getContextSpy: jest.SpiedFunction<HTMLCanvasElement['getContext']>;

  beforeEach(() => {
    getContextSpy = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
  });

  afterEach(() => {
    getContextSpy.mockRestore();
  });

  test('layout loop converges for long ordinal labels that overflow the band', () => {
    // Two ordinal categories whose labels are wider than the band: the trailing label is culled by overlap and
    // the edge overflow is reserved from the last visible label's real position, converging within the iteration cap.
    const container = { width: 200, height: 120, top: 0, left: 0 };
    const xSpec = MockGlobalSpec.xAxis({ id: 'x', position: Position.Bottom, title: 'X axis' });
    const ySpec = MockGlobalSpec.yAxis({
      id: 'y',
      position: Position.Left,
      title: 'Y axis',
      tickFormat: (value: number) => `value-${value}`,
    });
    const store = MockStore.default(container);
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins(),
        ySpec,
        xSpec,
        MockSeriesSpec.bar({
          data: [
            { x: 'first-category', y: 1 },
            { x: 'second-category', y: 2 },
          ],
          xScaleType: ScaleType.Ordinal,
        }),
      ],
      store,
    );

    const { dimensions, ticks, meta } = computeChartLayoutSelector(store.getState());

    expect(meta.iterations).toBe(4);
    expect(dimensions.chartDimensions.width).toBeGreaterThan(0);
    expect(dimensions.chartDimensions.height).toBeGreaterThan(0);
    checkIfLayoutConverged(container, [ySpec, xSpec], dimensions, ticks);
    expect(dimensions).toMatchSnapshot();
  });

  test('layout loop requires multiple iterations when bandwidth and label sizing interact', () => {
    // Three ordinal categories plus a wider y-axis label format create a feedback loop between
    // bandwidth, label truncation, and overflow margins that needs more than one corrective pass.
    const container = { width: 200, height: 120, top: 0, left: 0 };
    const xSpec = MockGlobalSpec.xAxis({
      id: 'x',
      position: Position.Bottom,
      title: 'X axis',
      style: { tickLabel: { wrapLines: 2, truncate: 'end' } },
    });
    const ySpec = MockGlobalSpec.yAxis({
      id: 'y',
      position: Position.Left,
      title: 'Y axis',
      tickFormat: (value: number) => `value-${value}`,
    });
    const store = MockStore.default(container);
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins(),
        ySpec,
        xSpec,
        MockSeriesSpec.bar({
          data: [
            { x: 'first-category', y: 1 },
            { x: 'second-category', y: 2 },
            { x: 'this is the longest category name in this story', y: 3 },
          ],
          xScaleType: ScaleType.Ordinal,
        }),
      ],
      store,
    );

    const { dimensions, ticks, meta } = computeChartLayoutSelector(store.getState());

    expect(meta.iterations).toBeGreaterThan(1);
    expect(meta.iterations).toBeLessThan(5);
    checkIfLayoutConverged(container, [ySpec, xSpec], dimensions, ticks);
  });

  test('left axis with short labels reserves space on the left', () => {
    const container = { width: 200, height: 120, top: 0, left: 0 };
    const store = MockStore.default(container);

    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins(),
        MockGlobalSpec.yAxis({ id: 'y', position: Position.Left, title: 'Y axis' }),
        MockSeriesSpec.bar({
          data,
          xScaleType: ScaleType.Ordinal,
        }),
      ],
      store,
    );

    const { dimensions } = computeChartLayoutSelector(store.getState());
    expect(dimensions).toMatchSnapshot();
  });

  test('without axes the chart area fills the container', () => {
    const store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
    MockStore.addSpecs(
      [MockGlobalSpec.settingsNoMargins(), MockSeriesSpec.bar({ data, xScaleType: ScaleType.Ordinal })],
      store,
    );

    const { dimensions, ticks } = computeChartLayoutSelector(store.getState());
    expect(ticks.size).toBe(0);
    expect(dimensions).toMatchSnapshot();
  });

  test('hidden axes do not reserve any space', () => {
    const container = { width: 200, height: 100, top: 0, left: 0 };
    const store = MockStore.default(container);
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins(),
        MockGlobalSpec.yAxis({ id: 'y', position: Position.Left, title: 'Y axis', hide: true }),
        MockSeriesSpec.bar({ data, xScaleType: ScaleType.Ordinal }),
      ],
      store,
    );

    const { dimensions } = computeChartLayoutSelector(store.getState());
    expect(dimensions).toMatchSnapshot();
  });

  test('minExtent enforces a floor on the axis band even when labels measure to zero', () => {
    const container = { width: 200, height: 100, top: 0, left: 0 };
    const store = MockStore.default(container);
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins(),
        MockGlobalSpec.yAxis({
          id: 'y',
          position: Position.Left,
          title: undefined,
          style: { minExtent: MIN_EXTENT },
        }),
        MockSeriesSpec.bar({ data, xScaleType: ScaleType.Ordinal }),
      ],
      store,
    );

    const { dimensions } = computeChartLayoutSelector(store.getState());
    expect(dimensions.chartDimensions.left).toBeGreaterThanOrEqual(MIN_EXTENT);
    expect(dimensions.chartDimensions.width).toBeLessThanOrEqual(container.width - MIN_EXTENT);
  });

  test('maxExtent caps the axis band', () => {
    const container = { width: 200, height: 100, top: 0, left: 0 };
    const store = MockStore.default(container);
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins(),
        MockGlobalSpec.yAxis({
          id: 'y',
          position: Position.Left,
          title: 'Y axis',
          style: { maxExtent: MAX_EXTENT },
        }),
        MockSeriesSpec.bar({ data, xScaleType: ScaleType.Ordinal }),
      ],
      store,
    );

    const { dimensions } = computeChartLayoutSelector(store.getState());
    expect(dimensions.chartDimensions.left).toBeLessThanOrEqual(MAX_EXTENT);
  });
});
