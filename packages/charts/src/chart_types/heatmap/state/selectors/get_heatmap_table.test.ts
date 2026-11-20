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
import type { HeatmapSpec } from '../../specs/heatmap';

const data = [
  { x: 'b', y: 20, value: 1 },
  { x: 'c', y: 3, value: 2 },
  { x: 'a', y: 100, value: 3 },
];

function getTable(spec: Partial<HeatmapSpec>) {
  const store = MockStore.default({ width: 700, height: 300, top: 0, left: 0 }, 'chartId');
  MockStore.addSpecs([MockGlobalSpec.settingsNoMargins(), MockSeriesSpec.heatmap({ data, ...spec })], store);
  return getHeatmapTableSelector(store.getState());
}

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
});
