/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { measureText } from '../../../../common/text_utils';
import { Theme } from '../../../../utils/themes/theme';
import { ShapeViewModel, nullShapeViewModel } from '../../layout/types/viewmodel_types';
import { shapeViewModel } from '../../layout/viewmodel/viewmodel';
import { HeatmapSpec } from '../../specs';
import { ChartElementSizes, HeatmapTable } from '../../state/selectors/compute_chart_dimensions';
import { ColorScale } from '../../state/selectors/get_color_scale';

/** @internal */
export function render(
  spec: HeatmapSpec,
  elementSizes: ChartElementSizes,
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
  return shapeViewModel(measureText(textMeasurerCtx), spec, theme, elementSizes, heatmapTable, colorScale, bandsToHide);
}
