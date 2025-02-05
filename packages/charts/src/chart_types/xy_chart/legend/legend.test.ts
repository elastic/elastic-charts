/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Store } from 'redux';

import { MockGlobalSpec, MockSeriesSpec } from '../../../mocks/specs/specs';
import { MockStore } from '../../../mocks/store/store';
import { ScaleType } from '../../../scales/constants';
import { SpecType } from '../../../specs';
import { onToggleDeselectSeriesAction } from '../../../state/actions/legend';
import { GlobalChartState } from '../../../state/chart_state';
import { Position, RecursivePartial } from '../../../utils/common';
import { AxisStyle } from '../../../utils/themes/theme';
import { ChartType } from '../../chart_type';
import { computeLegendSelector } from '../state/selectors/compute_legend';
import { computeSeriesDomainsSelector } from '../state/selectors/compute_series_domains';
import { getSeriesName, XYChartSeriesIdentifier } from '../utils/series';
import { AxisSpec, BasicSeriesSpec, SeriesType } from '../utils/specs';

const spec1: BasicSeriesSpec = {
  chartType: ChartType.XYAxis,
  specType: SpecType.Series,
  id: 'spec1',
  name: 'Spec 1 title',
  groupId: 'group',
  seriesType: SeriesType.Line,
  yScaleType: ScaleType.Log,
  xScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  data: [],
  hideInLegend: false,
};
const spec2: BasicSeriesSpec = {
  chartType: ChartType.XYAxis,
  specType: SpecType.Series,
  id: 'spec2',
  groupId: 'group',
  seriesType: SeriesType.Line,
  yScaleType: ScaleType.Log,
  xScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  data: [],
  hideInLegend: false,
};

const style: RecursivePartial<AxisStyle> = {
  tickLine: {
    size: 10,
    padding: 10,
  },
};
const axesSpecs: AxisSpec[] = [];
const axisSpec: AxisSpec = {
  chartType: ChartType.XYAxis,
  specType: SpecType.Axis,
  id: 'axis1',
  groupId: 'group1',
  hide: false,
  showOverlappingTicks: false,
  showOverlappingLabels: false,
  position: Position.Left,
  style,
  tickFormat: (value: any) => `${value}`,
  timeAxisLayerCount: 0,
};
axesSpecs.push(axisSpec);

describe('Legends', () => {
  let store: Store<GlobalChartState>;

  beforeEach(() => {
    store = MockStore.default();
  });

  function addBarSeries(n: number) {
    const colors = ['red', 'blue', 'green', 'violet', 'orange', 'yellow', 'brown', 'black', 'white', 'gray'];
    MockStore.addSpecs(
      [
        ...Array.from({ length: n }, (_, i) =>
          MockSeriesSpec.bar({
            id: `spec${i + 1}`,
            data: [
              {
                x: 0,
                y: 1,
              },
            ],
          }),
        ),
        MockGlobalSpec.settings({
          showLegend: true,
          theme: { colors: { vizColors: colors.slice(0, n) } },
        }),
      ],
      store,
    );
  }

  it('compute legend for a single series', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({
          name: 'Spec 1 title',
          yAccessors: ['y1'],
          data: [{ x: 0, y1: 1 }],
        }),
        MockGlobalSpec.settings({ showLegend: true, theme: { colors: { vizColors: ['red'] } } }),
      ],
      store,
    );
    const legend = computeLegendSelector(store.getState());
    const expected = {
      color: 'red',
      label: 'Spec 1 title',
      childId: 'y1',
      isItemHidden: false,
      isSeriesHidden: false,
      isToggleable: true,
      values: [],
      path: [{ index: 0, value: 'groupId{__global__}spec{spec1}yAccessor{y1}splitAccessors{}' }],
    };
    expect(legend[0]).toMatchObject(expected);
  });
  it('compute legend for a single spec but with multiple series', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({
          yAccessors: ['y1', 'y2'],
          splitSeriesAccessors: ['g'],
          data: [
            {
              x: 0,
              y1: 1,
              g: 'a',
              y2: 3,
            },
            {
              x: 0,
              y1: 1,
              g: 'b',
              y2: 3,
            },
          ],
        }),
        MockGlobalSpec.settings({
          showLegend: true,
          theme: { colors: { vizColors: ['red', 'blue', 'violet', 'green'] } },
        }),
      ],
      store,
    );
    const legend = computeLegendSelector(store.getState());

    const expected = [
      {
        color: 'red',
        label: 'a - y1',
        childId: 'y1',
        isItemHidden: false,
        isSeriesHidden: false,
        isToggleable: true,
        values: [],
        path: [{ index: 0, value: 'groupId{__global__}spec{spec1}yAccessor{y1}splitAccessors{g-a}' }],
      },
      {
        color: 'blue',
        label: 'a - y2',
        childId: 'y1',
        isItemHidden: false,
        isSeriesHidden: false,
        isToggleable: true,
        values: [],
        path: [{ index: 0, value: 'groupId{__global__}spec{spec1}yAccessor{y2}splitAccessors{g-a}' }],
      },
      {
        color: 'violet',
        label: 'b - y1',
        childId: 'y1',
        isItemHidden: false,
        isSeriesHidden: false,
        isToggleable: true,
        values: [],
        path: [{ index: 0, value: 'groupId{__global__}spec{spec1}yAccessor{y1}splitAccessors{g-b}' }],
      },
      {
        color: 'green',
        label: 'b - y2',
        childId: 'y1',
        isItemHidden: false,
        isSeriesHidden: false,
        isToggleable: true,
        values: [],
        path: [{ index: 0, value: 'groupId{__global__}spec{spec1}yAccessor{y2}splitAccessors{g-b}' }],
      },
    ];
    expect(legend).toHaveLength(4);
    expect(legend).toMatchObject(expected);
  });

  it('should order legend values by default sort when no legend sort defined', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({
          yAccessors: ['y1'],
          splitSeriesAccessors: ['g'],
          data: [
            {
              x: 0,
              y1: 1,
              g: 'c',
            },
            {
              x: 0,
              y1: 1,
              g: 'b',
            },
            {
              x: 0,
              y1: 1,
              g: 'a',
            },
          ],
        }),
        MockGlobalSpec.settings({
          showLegend: true,
          theme: { colors: { vizColors: ['red', 'blue', 'violet', 'green'] } },
          renderingSort: (a: XYChartSeriesIdentifier, b: XYChartSeriesIdentifier) => {
            const aG = a.splitAccessors.get('g') as string;
            const bG = b.splitAccessors.get('g') as string;

            return aG.localeCompare(bG);
          },
        }),
      ],
      store,
    );
    const legend = computeLegendSelector(store.getState());

    expect(legend).toMatchObject([{ label: 'a' }, { label: 'b' }, { label: 'c' }]);
  });

  it('should order legend values by legend sort over render sort', () => {
    const sort = (order: 'asc' | 'desc') => (a: XYChartSeriesIdentifier, b: XYChartSeriesIdentifier) => {
      const aG = a.splitAccessors.get('g') as string;
      const bG = b.splitAccessors.get('g') as string;
      return aG.localeCompare(bG) * (order === 'asc' ? 1 : -1);
    };
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({
          yAccessors: ['y1'],
          splitSeriesAccessors: ['g'],
          data: [
            {
              x: 0,
              y1: 1,
              g: 'c',
            },
            {
              x: 0,
              y1: 1,
              g: 'b',
            },
            {
              x: 0,
              y1: 1,
              g: 'a',
            },
          ],
        }),
        MockGlobalSpec.settings({
          showLegend: true,
          theme: { colors: { vizColors: ['red', 'blue', 'violet', 'green'] } },
          renderingSort: sort('asc'),
          legendSort: sort('desc'),
        }),
      ],
      store,
    );
    const legend = computeLegendSelector(store.getState());

    expect(legend).toMatchObject([{ label: 'c' }, { label: 'b' }, { label: 'a' }]);
  });

  it('compute legend for multiple specs', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({
          id: 'spec1',
          data: [
            {
              x: 0,
              y: 1,
            },
          ],
        }),
        MockSeriesSpec.bar({
          id: 'spec2',
          data: [
            {
              x: 0,
              y: 1,
            },
          ],
        }),
        MockGlobalSpec.settings({
          showLegend: true,
          theme: { colors: { vizColors: ['red', 'blue'] } },
        }),
      ],
      store,
    );
    const legend = computeLegendSelector(store.getState());
    const expected = [
      {
        color: 'red',
        label: 'spec1',
        childId: 'y1',
      },
      {
        color: 'blue',
        label: 'spec2',
        childId: 'y1',
        isItemHidden: false,
        isSeriesHidden: false,
        isToggleable: true,
        values: [],
        path: [{ index: 0, value: 'groupId{__global__}spec{spec2}yAccessor{y}splitAccessors{}' }],
      },
    ];
    expect(legend).toHaveLength(2);
    expect(legend).toMatchObject(expected);
  });

  it('default all series legend items to visible when deselectedDataSeries is null', () => {
    addBarSeries(3);
    const legend = computeLegendSelector(store.getState());

    const visibility = legend.map((item) => !item.isSeriesHidden);

    expect(visibility).toEqual([true, true, true]);
  });
  it('selectively sets series to visible when there are deselectedDataSeries items', () => {
    addBarSeries(3);
    const { key, specId } = computeSeriesDomainsSelector(store.getState()).formattedDataSeries[0]!;

    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: [{ key, specId }] }));
    const legend = computeLegendSelector(store.getState());
    const visibility = legend.map((item) => !item.isSeriesHidden);
    // only the clicked item should be visible
    expect(visibility).toEqual([true, false, false]);
  });
  it('resets all series to be visible when clicking again the only visible item', () => {
    addBarSeries(3);
    const { key, specId } = computeSeriesDomainsSelector(store.getState()).formattedDataSeries[0]!;
    // click the first item
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: [{ key, specId }] }));
    // now click again the same item
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: [{ key, specId }] }));
    const legend = computeLegendSelector(store.getState());
    const visibility = legend.map((item) => !item.isSeriesHidden);
    expect(visibility).toEqual([true, true, true]);
  });
  it('makes it visible when a hidden series is clicked', () => {
    addBarSeries(3);
    const { key, specId } = computeSeriesDomainsSelector(store.getState()).formattedDataSeries[0]!;
    // click the first item
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: [{ key, specId }] }));
    const { key: otherKey, specId: otherSpecId } = computeSeriesDomainsSelector(store.getState())
      .formattedDataSeries[1]!;
    // now click the second item (now hidden)
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: [{ key: otherKey, specId: otherSpecId }] }));
    const legend = computeLegendSelector(store.getState());
    const visibility = legend.map((item) => !item.isSeriesHidden);
    expect(visibility).toEqual([true, true, false]);
  });
  it('makes it hidden the clicked series if there are more than one series visible', () => {
    addBarSeries(3);
    const { key, specId } = computeSeriesDomainsSelector(store.getState()).formattedDataSeries[0]!;
    // click the first item
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: [{ key, specId }] }));
    const { key: otherKey, specId: otherSpecId } = computeSeriesDomainsSelector(store.getState())
      .formattedDataSeries[1]!;
    // now click the second item (now hidden)
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: [{ key: otherKey, specId: otherSpecId }] }));
    // ...and click again this second item to make it hidden
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: [{ key: otherKey, specId: otherSpecId }] }));
    const legend = computeLegendSelector(store.getState());
    const visibility = legend.map((item) => !item.isSeriesHidden);
    expect(visibility).toEqual([true, false, false]);
  });
  it('make it possible to hide all series using meta key on the only visible item', () => {
    addBarSeries(3);
    const { key, specId } = computeSeriesDomainsSelector(store.getState()).formattedDataSeries[0]!;
    // click the first item
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: [{ key, specId }] }));
    // now click again with the meta key enabled
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: [{ key, specId }], metaKey: true }));
    const legend = computeLegendSelector(store.getState());
    const visibility = legend.map((item) => !item.isSeriesHidden);
    expect(visibility).toEqual([false, false, false]);
  });
  it('returns the right series name for a color series', () => {
    const seriesIdentifier1 = {
      specId: '',
      xAccessor: 'x',
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: ['y1'],
      key: '',
    };
    const seriesIdentifier2 = {
      specId: '',
      xAccessor: 'x',
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: ['a', 'b', 'y1'],
      key: '',
    };

    // null removed, seriesIdentifier has to be at least an empty array
    let name = getSeriesName(seriesIdentifier1, true, false);
    expect(name).toBe('');
    name = getSeriesName(seriesIdentifier1, true, false, spec1);
    expect(name).toBe('Spec 1 title');
    name = getSeriesName(seriesIdentifier1, true, false, spec2);
    expect(name).toBe('spec2');
    name = getSeriesName(seriesIdentifier2, true, false, spec1);
    expect(name).toBe('Spec 1 title');
    name = getSeriesName(seriesIdentifier2, true, false, spec2);
    expect(name).toBe('spec2');

    name = getSeriesName(seriesIdentifier1, false, false, spec1);
    expect(name).toBe('Spec 1 title');
    name = getSeriesName(seriesIdentifier1, false, false, spec2);
    expect(name).toBe('spec2');
    name = getSeriesName(seriesIdentifier2, false, false, spec1);
    expect(name).toBe('a - b');
    name = getSeriesName(seriesIdentifier2, false, false, spec2);
    expect(name).toBe('a - b');

    name = getSeriesName(seriesIdentifier1, true, false, spec1);
    expect(name).toBe('Spec 1 title');
    name = getSeriesName(seriesIdentifier1, true, false, spec2);
    expect(name).toBe('spec2');
    name = getSeriesName(seriesIdentifier1, true, false);
    expect(name).toBe('');
    name = getSeriesName(seriesIdentifier1, true, false, spec1);
    expect(name).toBe('Spec 1 title');
    name = getSeriesName(seriesIdentifier1, true, false, spec2);
    expect(name).toBe('spec2');
  });
  it('use the split value as name if has a single series and splitSeries is used', () => {
    const seriesIdentifier1 = {
      specId: '',
      xAccessor: 'x',
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: ['y1'],
      key: '',
    };
    const seriesIdentifier2 = {
      specId: '',
      xAccessor: 'x',
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: ['a', 'b', 'y1'],
      key: '',
    };
    const seriesIdentifier3 = {
      specId: '',
      xAccessor: 'x',
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: ['a', 'y1'],
      key: '',
    };

    const specWithSplit: BasicSeriesSpec = {
      ...spec1,
      splitSeriesAccessors: ['g'],
    };
    let name = getSeriesName(seriesIdentifier1, true, false, specWithSplit);
    expect(name).toBe('Spec 1 title');

    name = getSeriesName(seriesIdentifier3, true, false, specWithSplit);
    expect(name).toBe('a');

    // happens when we have multiple values in splitSeriesAccessor
    // or we have also multiple yAccessors
    name = getSeriesName(seriesIdentifier2, true, false, specWithSplit);
    expect(name).toBe('a - b');

    // happens when the value of a splitSeriesAccessor is null
    name = getSeriesName(seriesIdentifier1, true, false, specWithSplit);
    expect(name).toBe('Spec 1 title');

    name = getSeriesName(seriesIdentifier1, false, false, specWithSplit);
    expect(name).toBe('Spec 1 title');
  });
});
