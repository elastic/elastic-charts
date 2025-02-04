/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeLegendSelector } from './compute_legend';
import { LegendItem } from '../../../../common/legend';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';

const getHighlightedLegendPath = (state: GlobalChartState) => state.interactions.highlightedLegendPath;

/** @internal */
export const getHighlightedSeriesSelector = createCustomCachedSelector(
  [getHighlightedLegendPath, computeLegendSelector],
  (highlightedLegendPaths, legendItems): LegendItem | undefined => {
    if (highlightedLegendPaths.length > 0) {
      const lookup = new Set(highlightedLegendPaths.map(({ value }) => value));
      return legendItems.find(({ seriesIdentifiers }) => seriesIdentifiers.some(({ key }) => lookup.has(key)));
    }
  },
);
