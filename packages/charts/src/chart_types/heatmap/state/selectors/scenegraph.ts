/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { measureText } from '../../../../common/text_utils';
import { SettingsSpec } from '../../../../specs';
import { RecursivePartial, mergePartial } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { config as defaultConfig } from '../../layout/config/config';
import { Config } from '../../layout/types/config_types';
import { ShapeViewModel, nullShapeViewModel } from '../../layout/types/viewmodel_types';
import { shapeViewModel } from '../../layout/viewmodel/viewmodel';
import { HeatmapSpec } from '../../specs';
import { HeatmapTable } from './compute_chart_dimensions';
import { ColorScaleType } from './get_color_scale';
import { GridHeightParams } from './get_grid_full_height';

/** @internal */
export function render(
  spec: HeatmapSpec,
  settingsSpec: SettingsSpec,
  chartDimensions: Dimensions,
  heatmapTable: HeatmapTable,
  colorScale: ColorScaleType,
  filterRanges: Array<[number, number | null]>,
  gridHeightParams: GridHeightParams,
): ShapeViewModel {
  const textMeasurer = document.createElement('canvas');
  const textMeasurerCtx = textMeasurer.getContext('2d');
  if (!textMeasurerCtx) {
    return nullShapeViewModel();
  }
  const { width, height } = chartDimensions;
  const { config: specConfig } = spec;
  const partialConfig: RecursivePartial<Config> = { ...specConfig, width, height };
  const config = mergePartial<Config>(defaultConfig, partialConfig);
  return shapeViewModel(
    measureText(textMeasurerCtx),
    spec,
    config,
    settingsSpec,
    chartDimensions,
    heatmapTable,
    colorScale,
    filterRanges,
    gridHeightParams,
  );
}
