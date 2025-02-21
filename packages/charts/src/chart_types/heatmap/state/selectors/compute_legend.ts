/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getColorScale } from './get_color_scale';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { isEmptySelector } from './is_empty';
import type { LegendItem } from '../../../../common/legend';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getDeselectedSeriesSelector } from '../../../../state/selectors/get_deselected_data_series';

const EMPTY_LEGEND: LegendItem[] = [];
/** @internal */
export const computeLegendSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector, getColorScale, getDeselectedSeriesSelector, isEmptySelector],
  (spec, { bands }, deselectedDataSeries, empty): LegendItem[] => {
    if (spec === null || empty) {
      return EMPTY_LEGEND;
    }

    return bands.map(({ label, color }) => {
      return {
        // the band label is considered unique by construction
        seriesIdentifiers: [{ key: label, specId: label }],
        depth: 0,
        color,
        label,
        isSeriesHidden: deselectedDataSeries.some(({ key }) => key === label),
        isToggleable: true,
        path: [{ index: 0, value: label }],
        keys: [],
        values: [],
      };
    });
  },
);
