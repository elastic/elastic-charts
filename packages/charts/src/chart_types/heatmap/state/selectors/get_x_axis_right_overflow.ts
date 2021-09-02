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
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

/**
 * @internal
 * Gets color scale based on specification and values range.
 */
export const getXAxisRightOverflow = createCustomCachedSelector(
  [getChartThemeSelector, getHeatmapSpecSelector, getHeatmapTableSelector],
  (
    {
      heatmap: {
        xAxisLabel: { fontSize, fontFamily, padding, width },
      },
    },
    { timeZone, xAxisLabelFormatter },
    { xDomain },
  ): number => {
    if (xDomain.type !== ScaleType.Time) {
      return 0;
    }
    if (typeof width === 'number') {
      return width / 2;
    }

    const timeScale = new ScaleContinuous(
      {
        type: ScaleType.Time,
        domain: xDomain.domain,
        range: [0, 1],
      },
      {
        timeZone,
      },
    );
    return withTextMeasure(
      (textMeasure) =>
        timeScale.ticks().reduce((acc, d) => {
          return Math.max(acc, textMeasure(xAxisLabelFormatter(d), padding, fontSize, fontFamily, 1).width + padding);
        }, 0) / 2,
    );
  },
);
