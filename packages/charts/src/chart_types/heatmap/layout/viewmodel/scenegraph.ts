/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { Theme } from '../../../../utils/themes/theme';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
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
  return withTextMeasure((measureText) => {
    return shapeViewModel(measureText, spec, theme, elementSizes, heatmapTable, colorScale, bandsToHide);
  });
}
