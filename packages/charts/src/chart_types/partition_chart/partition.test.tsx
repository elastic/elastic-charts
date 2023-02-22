/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Store } from 'redux';

import { HIERARCHY_ROOT_KEY, NULL_SMALL_MULTIPLES_KEY } from './layout/utils/group_by_rollup';
import { computeLegendSelector } from './state/selectors/compute_legend';
import { getLegendItemsLabels } from './state/selectors/get_legend_items_labels';
import { MockGlobalSpec, MockSeriesSpec } from '../../mocks/specs';
import { MockStore } from '../../mocks/store';
import { GlobalChartState } from '../../state/chart_state';
import { LegendItemLabel } from '../../state/selectors/get_legend_items_labels';

// sorting is useful to ensure tests pass even if order changes (where order doesn't matter)
const ascByLabel = (a: LegendItemLabel, b: LegendItemLabel) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0);

describe('Retain hierarchy even with arbitrary names', () => {
  type TestDatum = { cat1: string; cat2: string; val: number };
  const specJSON = {
    data: [
      { cat1: 'A', cat2: 'A', val: 1 },
      { cat1: 'A', cat2: 'B', val: 1 },
      { cat1: 'B', cat2: 'A', val: 1 },
      { cat1: 'B', cat2: 'B', val: 1 },
      { cat1: 'C', cat2: 'A', val: 1 },
      { cat1: 'C', cat2: 'B', val: 1 },
    ],
    valueAccessor: (d: TestDatum) => d.val,
    layers: [
      {
        groupByRollup: (d: TestDatum) => d.cat1,
      },
      {
        groupByRollup: (d: TestDatum) => d.cat2,
      },
    ],
  };
  let store: Store<GlobalChartState>;

  beforeEach(() => {
    store = MockStore.default();
  });

  describe('getLegendItemsLabels', () => {
    // todo discuss question marks about testing this selector, and also about unification with `get_legend_items_labels.test.ts`

    it('all distinct labels are present', () => {
      MockStore.addSpecs([MockGlobalSpec.settings({ showLegend: true }), MockSeriesSpec.sunburst(specJSON)], store);
      expect(getLegendItemsLabels(store.getState()).sort(ascByLabel)).toEqual([
        { depth: 1, label: 'A' },
        { depth: 2, label: 'A' },
        { depth: 2, label: 'A' },
        { depth: 2, label: 'A' },
        { depth: 2, label: 'B' },
        { depth: 1, label: 'B' },
        { depth: 2, label: 'B' },
        { depth: 2, label: 'B' },
        { depth: 1, label: 'C' },
      ]);
    });

    it('no labels are present if showLegend is false', () => {
      MockStore.addSpecs([MockGlobalSpec.settings({ showLegend: false }), MockSeriesSpec.sunburst(specJSON)], store);
      expect(getLegendItemsLabels(store.getState())).toEqual([]);
    });

    it('no labels are present if showLegend is missing', () => {
      MockStore.addSpecs([MockSeriesSpec.sunburst(specJSON)], store);
      expect(getLegendItemsLabels(store.getState())).toEqual([]);
    });

    it('special case: one input, one label', () => {
      MockStore.addSpecs(
        [
          MockGlobalSpec.settings({ showLegend: true }),
          MockSeriesSpec.sunburst({
            ...specJSON,
            data: [{ cat1: 'A', cat2: 'A', val: 1, percentage: '100%', valueText: 1 }],
          }),
        ],
        store,
      );
      expect(getLegendItemsLabels(store.getState())).toEqual([
        { depth: 1, label: 'A' },
        { depth: 2, label: 'A' },
      ]);
    });

    it('special case: one input, two labels', () => {
      MockStore.addSpecs(
        [
          MockGlobalSpec.settings({ showLegend: true }),
          MockSeriesSpec.sunburst({
            ...specJSON,
            data: [{ cat1: 'C', cat2: 'B', val: 1, parentName: 'A', percentage: '100%', valueText: '1' }],
          }),
        ],
        store,
      );
      expect(getLegendItemsLabels(store.getState()).sort(ascByLabel)).toEqual([
        { depth: 2, label: 'B' },
        { depth: 1, label: 'C' },
      ]);
    });

    it('special case: no labels', () => {
      MockStore.addSpecs(
        [MockGlobalSpec.settings({ showLegend: true }), MockSeriesSpec.sunburst({ ...specJSON, data: [] })],
        store,
      );
      expect(getLegendItemsLabels(store.getState()).map((l) => l.label)).toEqual([]);
    });
  });

  describe('getLegendItems', () => {
    // todo discuss question marks about testing this selector, and also about unification with `get_legend_items_labels.test.ts`

    it('all distinct labels are present', () => {
      MockStore.addSpecs(
        [
          MockGlobalSpec.settings({ showLegend: true }),
          MockGlobalSpec.settings({ showLegend: true }),
          MockSeriesSpec.sunburst(specJSON),
        ],
        store,
      );
      expect(computeLegendSelector(store.getState())).toMatchSnapshot();
    });

    it('special case: one input, one label', () => {
      MockStore.addSpecs(
        [
          MockGlobalSpec.settings({ showLegend: true }),
          MockSeriesSpec.sunburst({ ...specJSON, data: [{ cat1: 'A', cat2: 'A', val: 1 }] }),
        ],
        store,
      );
      expect(computeLegendSelector(store.getState())).toMatchSnapshot();
    });

    it('special case: one input, two labels', () => {
      MockStore.addSpecs(
        [
          MockGlobalSpec.settings({ showLegend: true }),
          MockSeriesSpec.sunburst({ ...specJSON, data: [{ cat1: 'C', cat2: 'B', val: 1 }] }),
        ],
        store,
      );
      expect(computeLegendSelector(store.getState())).toMatchSnapshot();
    });

    it('special case: no labels', () => {
      MockStore.addSpecs(
        [MockGlobalSpec.settings({ showLegend: true }), MockSeriesSpec.sunburst({ ...specJSON, data: [] })],
        store,
      );
      expect(getLegendItemsLabels(store.getState()).map((l) => l.label)).toEqual([]);
    });
  });
});
