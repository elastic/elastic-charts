/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import type { ChartSpecificScreenReaderData } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';

/** @internal */
export interface HeatmapScreenReaderData {
  heatmapSpec: ReturnType<typeof getHeatmapSpecSelector>;
}

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector],
  (heatmapSpec): ChartSpecificScreenReaderData => {
    const summaryParts: string[] = [];

    // Add heatmap-specific accessibility information
    if (heatmapSpec?.data && heatmapSpec.data.length > 0) {
      summaryParts.push(`${heatmapSpec.data.length} data ${heatmapSpec.data.length === 1 ? 'point' : 'points'}`);
    }

    return {
      data: {
        heatmapSpec,
      } as HeatmapScreenReaderData,
      summaryParts,
    };
  },
);
