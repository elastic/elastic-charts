/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleContinuous } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { horizontalPad } from '../../../../utils/dimensions';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

/**
 * @internal
 * Gets color scale based on specification and values range.
 */
export const getXAxisRightOverflow = createCustomCachedSelector(
  [getHeatmapSpecSelector, getChartThemeSelector, getHeatmapTableSelector],
  (
    { xScale, timeZone, xAxisLabelFormatter },
    {
      heatmap: {
        xAxisLabel: { fontSize, fontFamily, padding, width },
      },
    },
    { xNumericExtent },
  ) => {
    return xScale.type !== ScaleType.Time
      ? 0
      : typeof width === 'number'
      ? width / 2
      : withTextMeasure((measure) => {
          return new ScaleContinuous(
            { type: ScaleType.Time, domain: xNumericExtent, range: [0, 1] },
            { timeZone: xScale.type === ScaleType.Time ? timeZone : undefined },
          )
            .ticks()
            .reduce(
              (max, n) =>
                Math.max(max, measure(xAxisLabelFormatter(n), horizontalPad(padding), fontSize, fontFamily).width),
              0,
            );
        }) / 2;
  },
);
