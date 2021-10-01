/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Store } from 'redux';

import { MockGlobalSpec, MockSeriesSpec } from '../../../mocks/specs';
import { MockStore } from '../../../mocks/store';
import { ScaleType } from '../../../scales/constants';
import { onPointerMove } from '../../../state/actions/mouse';
import { computeSeriesGeometriesSelector } from '../state/selectors/compute_series_geometries';
import { getTooltipInfoAndGeometriesSelector } from '../state/selectors/get_tooltip_values_highlighted_geoms';
import { SeriesType, StackMode } from '../utils/specs';

const SPEC_ID = 'spec_1';
const GROUP_ID = 'group_1';

describe('Rendering bars', () => {
  test('Can render two bars within domain', () => {
    const store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
    const spec = MockSeriesSpec.bar({
      id: SPEC_ID,
      groupId: GROUP_ID,
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
      xAccessor: 0,
      yAccessors: [1],
      data: [
        [-200, 0],
        [0, 10],
        [1, 5],
      ], // first datum should be skipped as it's out of domain
    });
    MockStore.addSpecs(
      [spec, MockGlobalSpec.settingsNoMargins({ xDomain: [0, 1], theme: { colors: { vizColors: ['red'] } } })],
      store,
    );
    const { geometries } = computeSeriesGeometriesSelector(store.getState());

    expect(geometries.bars[0].value).toMatchSnapshot();
  });

  describe('Single series bar chart - ordinal', () => {
    test('Can render bars with value labels', () => {
      const store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
      MockStore.addSpecs(
        [
          MockSeriesSpec.bar({
            id: SPEC_ID,
            groupId: GROUP_ID,
            xScaleType: ScaleType.Ordinal,
            yScaleType: ScaleType.Linear,
            xAccessor: 0,
            yAccessors: [1],
            data: [
              [-200, 0],
              [0, 10],
              [1, 5],
            ], // first datum should be skipped as it's out of domain
            displayValueSettings: {
              showValueLabel: true,
              isAlternatingValueLabel: true,
              valueFormatter: (d) => d,
            },
          }),
          MockGlobalSpec.settingsNoMargins({ xDomain: [0, 1], theme: { colors: { vizColors: ['red'] } } }),
        ],
        store,
      );
      const { geometries } = computeSeriesGeometriesSelector(store.getState());
      expect(geometries.bars[0].value[0].displayValue).toBeDefined();
    });

    test('Can hide value labels if no formatter or showValueLabels is false/undefined', () => {
      const store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
      MockStore.addSpecs(
        [
          MockSeriesSpec.bar({
            id: SPEC_ID,
            groupId: GROUP_ID,
            xScaleType: ScaleType.Ordinal,
            yScaleType: ScaleType.Linear,
            xAccessor: 0,
            yAccessors: [1],
            data: [
              [-200, 0],
              [0, 10],
              [1, 5],
            ], // first datum should be skipped as it's out of domain
            displayValueSettings: {
              showValueLabel: false,
              isAlternatingValueLabel: true,
              valueFormatter: (d) => d,
            },
          }),
          MockGlobalSpec.settingsNoMargins({ xDomain: [0, 1], theme: { colors: { vizColors: ['red'] } } }),
        ],
        store,
      );
      const { geometries } = computeSeriesGeometriesSelector(store.getState());
      expect(geometries.bars[0].value[0].displayValue).toBeUndefined();
    });

    test('Can render bars with alternating value labels', () => {
      const store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
      MockStore.addSpecs(
        [
          MockSeriesSpec.bar({
            id: SPEC_ID,
            groupId: GROUP_ID,
            xScaleType: ScaleType.Ordinal,
            yScaleType: ScaleType.Linear,
            xAccessor: 0,
            yAccessors: [1],
            data: [
              [-200, 0],
              [0, 10],
              [1, 5],
            ], // first datum should be skipped as it's out of domain
            displayValueSettings: {
              showValueLabel: true,
              isAlternatingValueLabel: true,
              valueFormatter: (d) => d,
            },
          }),
          MockGlobalSpec.settingsNoMargins({ xDomain: [0, 1], theme: { colors: { vizColors: ['red'] } } }),
        ],
        store,
      );
      const { geometries } = computeSeriesGeometriesSelector(store.getState());

      expect(geometries.bars[0].value[0].displayValue?.text).toBeDefined();
      expect(geometries.bars[0].value[1].displayValue?.text).toBeUndefined();
    });

    test('Can render bars with contained value labels', () => {
      const store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
      MockStore.addSpecs(
        [
          MockSeriesSpec.bar({
            id: SPEC_ID,
            groupId: GROUP_ID,
            xScaleType: ScaleType.Ordinal,
            yScaleType: ScaleType.Linear,
            xAccessor: 0,
            yAccessors: [1],
            data: [
              [-200, 0],
              [0, 10],
              [1, 5],
            ], // first datum should be skipped as it's out of domain
            displayValueSettings: {
              showValueLabel: true,
              isValueContainedInElement: true,
              valueFormatter: (d) => d,
            },
          }),
          MockGlobalSpec.settingsNoMargins({ xDomain: [0, 1], theme: { colors: { vizColors: ['red'] } } }),
        ],
        store,
      );
      const { geometries } = computeSeriesGeometriesSelector(store.getState());

      expect(geometries.bars[0].value[0].displayValue?.width).toBe(50);
    });
  });
  describe('Multi series bar chart - ordinal', () => {
    const spec1Id = 'bar1';
    const spec2Id = 'bar2';
    const barSeriesSpec1 = MockSeriesSpec.bar({
      id: spec1Id,
      groupId: GROUP_ID,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    });
    const barSeriesSpec2 = MockSeriesSpec.bar({
      id: spec2Id,
      groupId: GROUP_ID,
      data: [
        [0, 20],
        [1, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    });
    const store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
    MockStore.addSpecs(
      [
        barSeriesSpec1,
        barSeriesSpec2,
        MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } }),
      ],
      store,
    );

    const {
      geometries: { bars },
    } = computeSeriesGeometriesSelector(store.getState());

    test('can render first spec bars', () => {
      expect(bars[0].value).toMatchSnapshot();
    });
    test('can render second spec bars', () => {
      expect(bars[1].value).toMatchSnapshot();
    });
  });

  describe('BarGeometryValue', () => {
    const partialSpec = {
      data: [
        { x: 0, y: 0, g: 'a' },
        { x: 1, y: null, g: 'a' },
        { x: 0, y: 4, g: 'b' },
        { x: 1, y: 5, g: 'b' },
        { x: 2, y: 2, g: 'b' },
      ],
      xAccessor: 'x',
      yAccessors: ['y'],
      splitSeriesAccessors: ['g'],
      stackAccessors: ['x'],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    let store: Store;
    beforeEach(() => {
      store = MockStore.default({ width: 90, height: 100, top: 0, left: 0 });
    });

    const tooltipValues = (s: Store) =>
      getTooltipInfoAndGeometriesSelector(s.getState()).tooltip.values.map((d) => [d.label, d.value]);

    it.each`
      type               | stackMode               | first                   | second        | third
      ${SeriesType.Bar}  | ${StackMode.Percentage} | ${[['a', 0], ['b', 1]]} | ${[['b', 1]]} | ${[['b', 1]]}
      ${SeriesType.Bar}  | ${undefined}            | ${[['a', 0], ['b', 4]]} | ${[['b', 5]]} | ${[['b', 2]]}
      ${SeriesType.Area} | ${StackMode.Percentage} | ${[['a', 0], ['b', 1]]} | ${[['b', 1]]} | ${[['b', 1]]}
      ${SeriesType.Area} | ${undefined}            | ${[['a', 0], ['b', 4]]} | ${[['b', 5]]} | ${[['b', 2]]}
    `(
      'stacked $type $stackMode tooltip should be consistent with the original nature of the datum',
      ({ type, stackMode, first, second, third }) => {
        MockStore.addSpecs(
          [
            MockSeriesSpec.byTypePartial(type)({ ...partialSpec, stackMode }),
            MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } }),
          ],
          store,
        );
        // move over the 1st bar
        store.dispatch(onPointerMove({ x: 15, y: 50 }, 0));
        expect(tooltipValues(store)).toIncludeSameMembers(first);
        // move over the 2nd bar (hide the null)
        store.dispatch(onPointerMove({ x: 45, y: 50 }, 1));
        expect(tooltipValues(store)).toIncludeSameMembers(second);
        // move over the 3rd bar (hide missing series)
        store.dispatch(onPointerMove({ x: 75, y: 50 }, 1));
        expect(tooltipValues(store)).toIncludeSameMembers(third);
      },
    );
  });
});
