/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { measureText } from '../../../../common/text_utils';
import { SettingsSpec } from '../../../../specs';
import { mergePartial } from '../../../../utils/common';
import { Theme } from '../../../../utils/themes/theme';
import { HeatmapSpec } from '../../specs';
import { ChartDims, HeatmapTable } from '../../state/selectors/compute_chart_dimensions';
import { ColorScale } from '../../state/selectors/get_color_scale';
import { DEFAULT_CONFIG } from '../config/config';
import { Config } from '../types/config_types';
import { ShapeViewModel, nullShapeViewModel } from '../types/viewmodel_types';
import { shapeViewModel } from './viewmodel';

/** @internal */
export function render(
  spec: HeatmapSpec,
  settingsSpec: SettingsSpec,
  chartDimensions: ChartDims,
  heatmapTable: HeatmapTable,
  colorScale: ColorScale,
  bandsToHide: Array<[number, number]>,
  theme: Theme,
): ShapeViewModel {
  const textMeasurer = document.createElement('canvas');
  const textMeasurerCtx = textMeasurer.getContext('2d');
  if (!textMeasurerCtx) {
    return nullShapeViewModel();
  }
  return shapeViewModel(
    measureText(textMeasurerCtx),
    spec,
    mergePartial<Config>(DEFAULT_CONFIG, spec.config),
    settingsSpec,
    chartDimensions,
    heatmapTable,
    colorScale,
    bandsToHide,
    theme,
  );
}
