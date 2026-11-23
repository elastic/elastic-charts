/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPerPanelHeatmapGeometries } from './get_per_panel_heatmap_geometries';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';

function getCellFontSizes(labelVisible: boolean) {
  const store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
  MockStore.addSpecs(
    [
      MockGlobalSpec.settingsNoMargins({ theme: { heatmap: { cell: { label: { visible: labelVisible } } } } }),
      MockSeriesSpec.heatmap({
        xScale: { type: ScaleType.Ordinal },
        data: [
          { x: 'a', y: 'ya', value: 1 },
          { x: 'b', y: 'ya', value: 2 },
          { x: 'a', y: 'yb', value: 3 },
          { x: 'b', y: 'yb', value: 4 },
        ],
      }),
    ],
    store,
  );
  return getPerPanelHeatmapGeometries(store.getState()).heatmapViewModels.flatMap(({ cells }) =>
    cells.map(({ fontSize }) => fontSize),
  );
}

describe('Heatmap cell font size', () => {
  it('is computed when cell labels are visible', () => {
    const fontSizes = getCellFontSizes(true);
    expect(fontSizes).toHaveLength(4);
    expect(fontSizes.every(Number.isFinite)).toBe(true);
  });

  it('is not computed when cell labels are hidden', () => {
    const fontSizes = getCellFontSizes(false);
    expect(fontSizes).toHaveLength(4);
    expect(fontSizes.every(Number.isNaN)).toBe(true);
  });
});
