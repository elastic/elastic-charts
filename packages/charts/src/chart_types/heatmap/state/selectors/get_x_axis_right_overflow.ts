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
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { getHeatmapConfigSelector } from './get_heatmap_config';
import { getHeatmapTableSelector } from './get_heatmap_table';

/**
 * @internal
 * Gets color scale based on specification and values range.
 */
export const getXAxisRightOverflow = createCustomCachedSelector(
  [getHeatmapConfigSelector, getHeatmapTableSelector],
  ({ xAxisLabel: { fontSize, fontFamily, padding, formatter, width }, timeZone }, { xDomain: { domain, type } }) => {
    return type !== ScaleType.Time
      ? 0
      : typeof width === 'number'
      ? width / 2
      : withTextMeasure((measure) =>
          new ScaleContinuous({ type: ScaleType.Time, domain: domain as number[], range: [0, 1] }, { timeZone })
            .ticks()
            .reduce((max, n) => Math.max(max, measure(formatter(n), padding, fontSize, fontFamily).width + padding), 0),
        ) / 2;
  },
);
