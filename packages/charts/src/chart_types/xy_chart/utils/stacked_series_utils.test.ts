/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { StackMode } from './specs';
import { MockSeriesSpec } from '../../../mocks/specs';
import { MockStore } from '../../../mocks/store';
import { ScaleType } from '../../../scales/constants';
import { computeSeriesDomainsSelector } from '../state/selectors/compute_series_domains';

describe('Stacked Series Utils', () => {
  const EMPTY_DATA_SET = MockSeriesSpec.area({
    xScaleType: ScaleType.Linear,
    yAccessors: ['y1'],
    splitSeriesAccessors: ['g'],
    stackAccessors: ['x'],
    data: [],
  });
  const STANDARD_DATA_SET = MockSeriesSpec.area({
    xScaleType: ScaleType.Linear,
    yAccessors: ['y1'],
    splitSeriesAccessors: ['g'],
    stackAccessors: ['x'],
    data: [
      { x: 0, y1: 10, g: 'a' },
      { x: 0, y1: 20, g: 'b' },
      { x: 0, y1: 30, g: 'c' },
    ],
  });
  const WITH_NULL_DATASET = MockSeriesSpec.area({
    xScaleType: ScaleType.Linear,
    yAccessors: ['y1'],
    splitSeriesAccessors: ['g'],
    stackAccessors: ['x'],
    data: [
      { x: 0, y1: 10, g: 'a' },
      { x: 0, y1: null, g: 'b' },
      { x: 0, y1: 30, g: 'c' },
    ],
  });

  const STANDARD_DATA_SET_WY0 = MockSeriesSpec.area({
    xScaleType: ScaleType.Linear,
    yAccessors: ['y1'],
    y0Accessors: ['y0'],
    splitSeriesAccessors: ['g'],
    stackAccessors: ['x'],
    data: [
      { x: 0, y0: 2, y1: 10, g: 'a' },
      { x: 0, y0: 4, y1: 20, g: 'b' },
      { x: 0, y0: 6, y1: 30, g: 'c' },
    ],
  });
  const WITH_NULL_DATASET_WY0 = MockSeriesSpec.area({
    xScaleType: ScaleType.Linear,
    yAccessors: ['y1'],
    y0Accessors: ['y0'],
    splitSeriesAccessors: ['g'],
    stackAccessors: ['x'],
    data: [
      { x: 0, y0: 2, y1: 10, g: 'a' },
      { x: 0, y1: null, g: 'b' },
      { x: 0, y0: 6, y1: 30, g: 'c' },
    ],
  });

  const DATA_SET_WITH_NULL_2 = MockSeriesSpec.area({
    xScaleType: ScaleType.Linear,
    yAccessors: ['y1'],
    splitSeriesAccessors: ['g'],
    stackAccessors: ['x'],
    data: [
      { x: 1, y1: 1, g: 'a' },
      { x: 2, y1: 2, g: 'a' },
      { x: 4, y1: 4, g: 'a' },
      { x: 1, y1: 21, g: 'b' },
      { x: 3, y1: 23, g: 'b' },
    ],
  });

  describe('compute stacked arrays', () => {
    test('with empty values', () => {
      const store = MockStore.default();
      MockStore.addSpecs(EMPTY_DATA_SET, store);
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());
      expect(formattedDataSeries).toHaveLength(0);
    });
    test('with basic values', () => {
      const store = MockStore.default();
      MockStore.addSpecs(STANDARD_DATA_SET, store);
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());

      // stacked series are reverse ordered
      const values = [
        formattedDataSeries[0]?.data[0]?.y0,
        formattedDataSeries[0]?.data[0]?.y1,
        formattedDataSeries[1]?.data[0]?.y1,
        formattedDataSeries[2]?.data[0]?.y1,
      ];
      expect(values).toEqual([0, 10, 30, 60]);
    });

    test('with basic values in percentage', () => {
      const store = MockStore.default();
      MockStore.addSpecs(
        MockSeriesSpec.area({
          ...STANDARD_DATA_SET,
          stackMode: StackMode.Percentage,
        }),
        store,
      );
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());

      const values = [
        formattedDataSeries[0]?.data[0]?.y0,
        formattedDataSeries[0]?.data[0]?.y1,
        formattedDataSeries[1]?.data[0]?.y1,
        formattedDataSeries[2]?.data[0]?.y1,
      ];
      expect(values).toEqual([0, 0.16666666666666666, 0.5, 1]);
    });
    test('with null values', () => {
      const store = MockStore.default();
      MockStore.addSpecs(WITH_NULL_DATASET, store);
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());

      const values = [
        formattedDataSeries[0]?.data[0]?.y0,
        formattedDataSeries[0]?.data[0]?.y1,
        formattedDataSeries[1]?.data[0]?.y1,
        formattedDataSeries[2]?.data[0]?.y1,
      ];
      expect(values).toEqual([0, 10, 10, 40]);
    });
    test('with null values as percentage', () => {
      const store = MockStore.default();
      MockStore.addSpecs(
        MockSeriesSpec.area({
          ...WITH_NULL_DATASET,
          stackAccessors: ['yes'],
          stackMode: StackMode.Percentage,
        }),
        store,
      );
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());

      const values = [
        formattedDataSeries[0]?.data[0]?.y0,
        formattedDataSeries[0]?.data[0]?.y1,
        formattedDataSeries[1]?.data[0]?.y1,
        formattedDataSeries[2]?.data[0]?.y1,
      ];
      expect(values).toEqual([0, 0.25, 0.25, 1]);
    });
  });
  describe('Format stacked dataset', () => {
    test('format data without nulls', () => {
      const store = MockStore.default();
      MockStore.addSpecs(STANDARD_DATA_SET, store);
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());

      expect(formattedDataSeries[0]?.data[0]).toMatchObject({
        initialY0: null,
        initialY1: 10,
        x: 0,
        y0: 0,
        y1: 10,
        mark: null,
      });
      expect(formattedDataSeries[1]?.data[0]).toMatchObject({
        initialY0: null,
        initialY1: 20,
        x: 0,
        y0: 10,
        y1: 30,
        mark: null,
      });
      expect(formattedDataSeries[2]?.data[0]).toMatchObject({
        initialY0: null,
        initialY1: 30,
        x: 0,
        y0: 30,
        y1: 60,
        mark: null,
      });
    });
    test('format data with nulls', () => {
      const store = MockStore.default();
      MockStore.addSpecs(WITH_NULL_DATASET, store);
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());

      expect(formattedDataSeries[1]?.data[0]).toMatchObject({
        initialY0: null,
        initialY1: null,
        x: 0,
        y1: 10,
        y0: 10,
        mark: null,
      });
    });
    test('format data without nulls with y0 values', () => {
      const store = MockStore.default();
      MockStore.addSpecs(STANDARD_DATA_SET_WY0, store);
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());

      expect(formattedDataSeries[0]?.data[0]).toMatchObject({
        initialY0: 2,
        initialY1: 10,
        x: 0,
        y0: 0,
        y1: 10,
        mark: null,
      });
      expect(formattedDataSeries[1]?.data[0]).toMatchObject({
        initialY0: 4,
        initialY1: 20,
        x: 0,
        y0: 10,
        y1: 30,
        mark: null,
      });
      expect(formattedDataSeries[2]?.data[0]).toMatchObject({
        initialY0: 6,
        initialY1: 30,
        x: 0,
        y0: 30,
        y1: 60,
        mark: null,
      });
    });
    test('format data with nulls - missing points', () => {
      const store = MockStore.default();
      MockStore.addSpecs(WITH_NULL_DATASET_WY0, store);
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());

      expect(formattedDataSeries[0]?.data[0]).toMatchObject({
        initialY0: 2,
        initialY1: 10,
        x: 0,
        y0: 0,
        y1: 10,
        mark: null,
      });
      expect(formattedDataSeries[1]?.data[0]).toMatchObject({
        initialY0: null,
        initialY1: null,
        x: 0,
        y0: 10,
        y1: 10,
        mark: null,
      });
      expect(formattedDataSeries[2]?.data[0]).toMatchObject({
        initialY0: 6,
        initialY1: 30,
        x: 0,
        y0: 10,
        y1: 40,
        mark: null,
      });
    });
    test('format data without nulls on second series', () => {
      const store = MockStore.default();
      MockStore.addSpecs(DATA_SET_WITH_NULL_2, store);
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());

      expect(formattedDataSeries).toHaveLength(2);
      expect(formattedDataSeries[0]?.data).toHaveLength(4);
      expect(formattedDataSeries[1]?.data).toHaveLength(4);

      expect(formattedDataSeries[0]?.data[0]).toMatchObject({
        initialY0: null,
        initialY1: 1,
        x: 1,
        y0: 0,
        y1: 1,
        mark: null,
      });
      expect(formattedDataSeries[0]?.data[1]).toMatchObject({
        initialY0: null,
        initialY1: 2,
        x: 2,
        y0: 0,
        y1: 2,
        mark: null,
      });
      expect(formattedDataSeries[0]?.data[3]).toMatchObject({
        initialY0: null,
        initialY1: 4,
        x: 4,
        y0: 0,
        y1: 4,
        mark: null,
      });
      expect(formattedDataSeries[1]?.data[0]).toMatchObject({
        initialY0: null,
        initialY1: 21,
        x: 1,
        y0: 1,
        y1: 22,
        mark: null,
      });
      expect(formattedDataSeries[1]?.data[2]).toMatchObject({
        initialY0: null,
        initialY1: 23,
        x: 3,
        y0: 0,
        y1: 23,
        mark: null,
      });
    });
  });
  test('Correctly handle 0 values on percentage stack', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      MockSeriesSpec.area({
        xScaleType: ScaleType.Linear,
        yAccessors: ['y1'],
        splitSeriesAccessors: ['g'],
        stackAccessors: ['x'],
        data: [
          { x: 1, y1: 0, g: 'a' },
          { x: 1, y1: 0, g: 'b' },
        ],
      }),
      store,
    );
    const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());

    expect(formattedDataSeries[1]?.data[0]).toMatchObject({
      initialY0: null,
      initialY1: 0,
      x: 1,
      y0: 0,
      y1: 0,
      mark: null,
    });
    expect(formattedDataSeries[0]?.data[0]).toMatchObject({
      initialY0: null,
      initialY1: 0,
      x: 1,
      y0: 0,
      y1: 0,
      mark: null,
    });
  });

  describe('Stack modes with mixed and negative polarity', () => {
    const MIXED_DATA = [
      { x: 0, y1: 1, g: 'a' },
      { x: 1, y1: 2, g: 'a' },
      { x: 2, y1: -1, g: 'a' },
      { x: 0, y1: 3, g: 'b' },
      { x: 1, y1: -2, g: 'b' },
      { x: 2, y1: 4, g: 'b' },
      { x: 0, y1: -1, g: 'c' },
      { x: 1, y1: 1, g: 'c' },
      { x: 2, y1: 2, g: 'c' },
    ];
    const NEGATIVE_DATA = [
      { x: 0, y1: -2, g: 'a' },
      { x: 1, y1: -3, g: 'a' },
      { x: 2, y1: -2, g: 'a' },
      { x: 0, y1: -4, g: 'b' },
      { x: 1, y1: -3, g: 'b' },
      { x: 2, y1: -5, g: 'b' },
      { x: 0, y1: -2, g: 'c' },
      { x: 1, y1: -2, g: 'c' },
      { x: 2, y1: -3, g: 'c' },
    ];
    const stackedXY0Y1 = (data: typeof MIXED_DATA, stackMode?: StackMode) => {
      const store = MockStore.default();
      MockStore.addSpecs(
        MockSeriesSpec.bar({
          xScaleType: ScaleType.Linear,
          yAccessors: ['y1'],
          splitSeriesAccessors: ['g'],
          stackAccessors: ['x'],
          stackMode,
          data,
        }),
        store,
      );
      const { formattedDataSeries } = computeSeriesDomainsSelector(store.getState());
      return formattedDataSeries.map(({ data: series }) => series.map(({ x, y0, y1 }) => [x, y0, y1]));
    };

    test('default stacking with mixed polarity stacks negative values downward', () => {
      expect(stackedXY0Y1(MIXED_DATA)).toEqual([
        [
          [0, 0, 1],
          [1, 0, 2],
          [2, 0, -1],
        ],
        [
          [0, 1, 4],
          [1, 0, -2],
          [2, 0, 4],
        ],
        [
          [0, 0, -1],
          [1, 2, 3],
          [2, 4, 6],
        ],
      ]);
    });

    test('percentage with mixed polarity treats negative values as participation', () => {
      expect(stackedXY0Y1(MIXED_DATA, StackMode.Percentage)).toEqual([
        [
          [0, 0.2, 0.4],
          [1, 0.4, 0.8],
          [2, 0, 0.14285714285714285],
        ],
        [
          [0, 0.4, 1],
          [1, 0, 0.4],
          [2, 0.14285714285714285, 0.7142857142857142],
        ],
        [
          [0, 0, 0.2],
          [1, 0.8, 1],
          [2, 0.7142857142857142, 0.9999999999999999],
        ],
      ]);
    });

    test('wiggle with mixed polarity uses the diverging wiggle offset', () => {
      expect(stackedXY0Y1(MIXED_DATA, StackMode.Wiggle)).toEqual([
        [
          [0, 1, 2],
          [1, 1, 3],
          [2, -1.7000000000000002, -2.7],
        ],
        [
          [0, 2, 5],
          [1, 1, -1],
          [2, -1.7000000000000002, 2.3],
        ],
        [
          [0, 1, 0],
          [1, 3, 4],
          [2, 2.3, 4.3],
        ],
      ]);
    });

    test('wiggle with only negative values uses the d3 wiggle offset', () => {
      expect(stackedXY0Y1(NEGATIVE_DATA, StackMode.Wiggle)).toEqual([
        [
          [0, 0, -2],
          [1, 0.375, -2.625],
          [2, 0.725, -1.275],
        ],
        [
          [0, -2, -6],
          [1, -2.625, -5.625],
          [2, -1.275, -6.275],
        ],
        [
          [0, -6, -8],
          [1, -5.625, -7.625],
          [2, -6.275, -9.275],
        ],
      ]);
    });

    test('silhouette centers the stack around zero', () => {
      expect(stackedXY0Y1(MIXED_DATA, StackMode.Silhouette)).toEqual([
        [
          [0, -1.5, -0.5],
          [1, -0.5, 1.5],
          [2, -2.5, -3.5],
        ],
        [
          [0, -0.5, 2.5],
          [1, -0.5, -2.5],
          [2, -2.5, 1.5],
        ],
        [
          [0, -1.5, -2.5],
          [1, 1.5, 2.5],
          [2, 1.5, 3.5],
        ],
      ]);
    });
  });
});
