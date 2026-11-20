/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHeatmapTableSelector } from './get_heatmap_table';
import { Predicate } from '../../../../common/predicate';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import type { SettingsSpec } from '../../../../specs/settings';
import type { HeatmapSpec } from '../../specs/heatmap';

const data = [
  { x: 'b', y: 20, value: 1 },
  { x: 'c', y: 3, value: 2 },
  { x: 'a', y: 100, value: 3 },
];

function getTable(spec: Partial<HeatmapSpec>, settings?: Pick<SettingsSpec, 'xDomain'>) {
  const store = MockStore.default({ width: 700, height: 300, top: 0, left: 0 }, 'chartId');
  MockStore.addSpecs([MockGlobalSpec.settingsNoMargins(settings), MockSeriesSpec.heatmap({ data, ...spec })], store);
  return getHeatmapTableSelector(store.getState());
}

const linearData = [
  { x: 0, y: 'a', value: 1 },
  { x: 20, y: 'a', value: 2 },
  { x: 50, y: 'b', value: 3 },
];

describe('getHeatmapTableSelector', () => {
  it('should sort ordinal axes by the deprecated sort predicates by default', () => {
    const { xValues, yValues } = getTable({
      xSortPredicate: Predicate.AlphaDesc,
      ySortPredicate: Predicate.NumAsc,
    });
    expect(xValues).toEqual(['c', 'b', 'a']);
    expect(yValues).toEqual([3, 20, 100]);
  });

  it('should prefer the scale sort over the deprecated sort predicates', () => {
    const { xValues, yValues } = getTable({
      xScale: { type: ScaleType.Ordinal, sort: Predicate.AlphaAsc },
      yScale: { type: ScaleType.Ordinal, sort: Predicate.NumDesc },
      xSortPredicate: Predicate.AlphaDesc,
      ySortPredicate: Predicate.NumAsc,
    });
    expect(xValues).toEqual(['a', 'b', 'c']);
    expect(yValues).toEqual([100, 20, 3]);
  });

  it('should preserve the data order with the DataIndex sort', () => {
    const { xValues, yValues } = getTable({
      xScale: { type: ScaleType.Ordinal, sort: Predicate.DataIndex },
      yScale: { type: ScaleType.Ordinal, sort: Predicate.DataIndex },
    });
    expect(xValues).toEqual(['b', 'c', 'a']);
    expect(yValues).toEqual([20, 3, 100]);
  });

  it('should render the deprecated linear scale as ordinal preserving the data order', () => {
    const { xValues } = getTable({
      xScale: { type: ScaleType.Linear },
      xSortPredicate: Predicate.AlphaAsc,
    });
    expect(xValues).toEqual(['b', 'c', 'a']);
  });

  it('should render a linear scale with an invalid interval as the deprecated linear scale', () => {
    const { xValues } = getTable({ data: linearData, xScale: { type: ScaleType.Linear, interval: 0 } });
    expect(xValues).toEqual([0, 20, 50]);
  });

  describe('raster linear scale', () => {
    it('should fill the bins without data', () => {
      const { xValues, table } = getTable({ data: linearData, xScale: { type: ScaleType.Linear, interval: 10 } });
      expect(xValues).toEqual([0, 10, 20, 30, 40, 50]);
      expect(table).toHaveLength(3);
    });

    it('should generate bins matching decimal data values', () => {
      const { xValues } = getTable({
        data: [
          { x: 0.1, y: 'a', value: 1 },
          { x: 0.7, y: 'a', value: 2 },
        ],
        xScale: { type: ScaleType.Linear, interval: 0.1 },
      });
      expect(xValues).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
    });

    it('should not add a bin before a domain bound on a decimal bin edge', () => {
      const { xValues } = getTable({
        data: [
          { x: 0.1, y: 'a', value: 1 },
          { x: 0.7, y: 'a', value: 2 },
        ],
        xScale: { type: ScaleType.Linear, interval: 0.1, domain: { min: 0.7, max: 0.9 } },
      });
      expect(xValues).toEqual([0.7, 0.8]);
    });

    it('should clip the bins and the data to the domain', () => {
      const { xValues, table } = getTable({
        data: linearData,
        xScale: { type: ScaleType.Linear, interval: 10, domain: { min: 15, max: 40 } },
      });
      expect(xValues).toEqual([10, 20, 30]);
      expect(table.map(({ x }) => x)).toEqual([20]);
    });

    it('should use the data extent for a missing domain bound', () => {
      const { xValues } = getTable({
        data: linearData,
        xScale: { type: ScaleType.Linear, interval: 10, domain: { min: 30 } },
      });
      expect(xValues).toEqual([30, 40, 50]);
    });

    it('should align the bins to the data when the domain is not aligned', () => {
      const { xValues } = getTable({
        data: linearData,
        xScale: { type: ScaleType.Linear, interval: 10, domain: { min: -15, max: 25 } },
      });
      expect(xValues).toEqual([-20, -10, 0, 10, 20]);
    });

    it('should align the bins to the multiples of the interval without data', () => {
      const { xValues } = getTable({
        data: [],
        xScale: { type: ScaleType.Linear, interval: 10, domain: { min: 5, max: 35 } },
      });
      expect(xValues).toEqual([0, 10, 20, 30]);
    });

    it('should fill the y bins', () => {
      const { yValues } = getTable({
        data: [
          { x: 'a', y: 0, value: 1 },
          { x: 'a', y: 20, value: 2 },
        ],
        yScale: { type: ScaleType.Linear, interval: 10 },
      });
      expect(yValues).toEqual([0, 10, 20]);
    });
  });
});
