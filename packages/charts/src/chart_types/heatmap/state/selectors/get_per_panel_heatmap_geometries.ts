/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSmallMultiplesIndexOrderSelector } from '../../../../common/panel_utils';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeSmallMultipleScalesSelector } from '../../../../state/selectors/compute_small_multiple_scales';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { computeScenegraph } from '../../layout/viewmodel/scenegraph';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeChartElementSizesSelector } from './compute_chart_element_sizes';
import { getColorScale } from './get_color_scale';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';
import { isEmptySelector } from './is_empty';

const getDeselectedSeriesSelector = (state: GlobalChartState) => state.interactions.deselectedDataSeries;

/** @internal */
export const getPerPanelHeatmapGeometries = createCustomCachedSelector(
  [
    getHeatmapSpecSelector,
    computeChartDimensionsSelector,
    computeChartElementSizesSelector,
    getHeatmapTableSelector,
    getColorScale,
    getDeselectedSeriesSelector,
    getChartThemeSelector,
    isEmptySelector,
    computeSmallMultipleScalesSelector,
    getSmallMultiplesIndexOrderSelector,
  ],
  (
    heatmapSpec,
    chartDimensions,
    elementSizes,
    heatmapTable,
    { bands, scale: colorScale },
    deselectedSeries,
    theme,
    empty,
    smScales,
  ): ShapeViewModel => {
    // instead of using the specId, each legend item is associated with an unique band label
    const disabledBandLabels = new Set(deselectedSeries.map(({ specId }) => specId));
    const bandsToHide: Array<[number, number]> = bands
      .filter(({ label }) => disabledBandLabels.has(label))
      .map(({ start, end }) => [start, end]);

    return heatmapSpec && !empty
      ? computeScenegraph(
          heatmapSpec,
          chartDimensions,
          elementSizes,
          smScales,
          heatmapTable,
          colorScale,
          bandsToHide,
          theme,
        )
      : nullShapeViewModel();
  },
);
