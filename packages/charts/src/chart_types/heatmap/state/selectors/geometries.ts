/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { render } from '../../layout/viewmodel/scenegraph';
import { computeChartElementSizesSelector } from './compute_chart_dimensions';
import { getColorScale } from './get_color_scale';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';
import { isEmptySelector } from './is_empty';

const getDeselectedSeriesSelector = (state: GlobalChartState) => state.interactions.deselectedDataSeries;

/** @internal */
export const getHeatmapGeometries = createCustomCachedSelector(
  [
    getHeatmapSpecSelector,
    computeChartElementSizesSelector,
    getHeatmapTableSelector,
    getColorScale,
    getDeselectedSeriesSelector,
    getChartThemeSelector,
    isEmptySelector,
  ],
  (heatmapSpec, dims, heatmapTable, { bands, scale: colorScale }, deselectedSeries, theme, empty): ShapeViewModel => {
    // instead of using the specId, each legend item is associated with an unique band label
    const disabledBandLabels = new Set(deselectedSeries.map(({ specId }) => specId));
    const bandsToHide: Array<[number, number]> = bands
      .filter(({ label }) => disabledBandLabels.has(label))
      .map(({ start, end }) => [start, end]);

    return heatmapSpec && !empty
      ? render(heatmapSpec, dims, heatmapTable, colorScale, bandsToHide, theme)
      : nullShapeViewModel();
  },
);
