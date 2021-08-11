/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getColorScale } from './get_color_scale';
import { getGridHeightParamsSelector } from './get_grid_full_height';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';
import { render } from './scenegraph';

const getDeselectedSeriesSelector = (state: GlobalChartState) => state.interactions.deselectedDataSeries;

/** @internal */
export const geometries = createCustomCachedSelector(
  [
    getHeatmapSpecSelector,
    computeChartDimensionsSelector,
    getSettingsSpecSelector,
    getHeatmapTableSelector,
    getColorScale,
    getDeselectedSeriesSelector,
    getGridHeightParamsSelector,
  ],
  (
    heatmapSpec,
    chartDimensions,
    settingSpec,
    heatmapTable,
    { bands, scale: colorScale },
    deselectedSeries,
    gridHeightParams,
  ): ShapeViewModel => {
    const deselectedRanges = new Set(
      deselectedSeries.map(({ specId }) => {
        return Number(specId);
      }),
    );
    const visibilityFilterRanges = bands.reduce<Array<[number, number]>>((acc, { start }, i) => {
      if (deselectedRanges.has(start)) {
        const rangeEnd = bands.length === i + 1 ? Infinity : bands[i + 1].start;
        acc.push([start, rangeEnd]);
      }
      return acc;
    }, []);

    return heatmapSpec
      ? render(
          heatmapSpec,
          settingSpec,
          chartDimensions,
          heatmapTable,
          colorScale,
          visibilityFilterRanges,
          gridHeightParams,
        )
      : nullShapeViewModel();
  },
);
