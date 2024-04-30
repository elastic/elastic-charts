/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { MockGlobalSpec, MockSeriesSpec } from '../../../mocks/specs';
import { MockStore } from '../../../mocks/store';
import { ScaleType } from '../../../scales/constants';
import { BarGeometry } from '../../../utils/geometry';
import { computeSeriesGeometriesSelector } from '../state/selectors/compute_series_geometries';

const SPEC_ID = 'spec_1';
const GROUP_ID = 'group_1';

describe('Rendering bars', () => {
  it('should render two bars within domain', () => {
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

    expect(geometries.bars[0]?.value).toMatchSnapshot();
  });

  describe('Single series bar chart - ordinal', () => {
    it('should render bars with value labels', () => {
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
      expect(geometries.bars[0]?.value[0]?.displayValue).toBeDefined();
    });

    it('should hide value labels if no formatter or showValueLabels is false/undefined', () => {
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
      expect(geometries.bars[0]?.value[0]?.displayValue).toBeUndefined();
    });

    it('should render bars with alternating value labels', () => {
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

      expect(geometries.bars[0]?.value[0]?.displayValue?.text).toBeDefined();
      expect(geometries.bars[0]?.value[1]?.displayValue?.text).toBeUndefined();
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
      expect(bars[0]?.value).toMatchSnapshot();
    });
    test('can render second spec bars', () => {
      expect(bars[1]?.value).toMatchSnapshot();
    });
  });

  describe('Negative, minBarHeight, flipped and banded datasets', () => {
    it('should render bars with alternating value labels', () => {
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
            y0Accessors: [2],
            data: [
              [1, -1000, 0],
              [2, -100, 0],
              [3, -10, 0],
              [4.5, -10, 10],
              [5, -1, 0],
              [6, 0, 0],
              [7, -1, 0],
              [8, 0, 0],
              [9, 0, 0],
              [10, 5, 10],
              [11, 1, -10],
              [12, 1, 0],
              [13, 0, 0],
              [14, 1, 0],
              [15, 10, -10],
              [16, 10, 0],
              [17, 100, 0],
              [18, 0, 1000],
            ],
          }),
        ],
        store,
      );
      const { geometriesIndex } = computeSeriesGeometriesSelector(store.getState());
      const indexedBarGeometries = geometriesIndex.getMergeData().linearGeometries as BarGeometry[][];

      expect(indexedBarGeometries).toSatisfyAll<BarGeometry[][]>(({ length }) => length === 2);
      indexedBarGeometries.forEach(([upper, lower]) => {
        return upper!.y === lower!.bandedY && lower!.y === upper!.bandedY;
      });
      expect(geometriesIndex).toMatchSnapshot();
    });
  });
});
