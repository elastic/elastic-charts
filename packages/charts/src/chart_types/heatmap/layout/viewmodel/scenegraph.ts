/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SmallMultipleScales, SmallMultiplesGroupBy } from '../../../../common/panel_utils';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { Theme } from '../../../../utils/themes/theme';
import { ChartDimensions } from '../../../xy_chart/utils/dimensions';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { shapeViewModel } from '../../layout/viewmodel/viewmodel';
import { HeatmapSpec } from '../../specs';
import { ChartElementSizes } from '../../state/selectors/compute_chart_element_sizes';
import { ColorScale } from '../../state/selectors/get_color_scale';
import { HeatmapTable } from '../../state/selectors/get_heatmap_table';

/** @internal */
export function computeScenegraph(
  spec: HeatmapSpec,
  chartDimensions: ChartDimensions,
  elementSizes: ChartElementSizes,
  smScales: SmallMultipleScales,
  groupBySpec: SmallMultiplesGroupBy,
  heatmapTable: HeatmapTable,
  colorScale: ColorScale,
  bandsToHide: Array<[number, number]>,
  theme: Theme,
): ShapeViewModel {
  return withTextMeasure((measureText) => {
    return shapeViewModel(
      measureText,
      spec,
      theme,
      chartDimensions,
      elementSizes,
      heatmapTable,
      colorScale,
      smScales,
      groupBySpec,
      bandsToHide,
    );
  });
}
