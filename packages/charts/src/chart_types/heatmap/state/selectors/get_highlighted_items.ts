/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeLegendSelector } from './compute_legend';
import type { LegendItem } from '../../../../common/legend';
import type { LegendPath } from '../../../../state/actions/legend';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';

const getHighlightedPaths = (state: GlobalChartState): LegendPath[] => state.interactions.highlightedPaths;

/** @internal */
export const getHighlightedItemsSelector = createCustomCachedSelector(
  [getHighlightedPaths, computeLegendSelector],
  (highlightedPaths, legendItems): LegendItem[] => {
    if (highlightedPaths.length === 0) return [];
    const lookup = new Set(highlightedPaths.flatMap((path) => path.map(({ value }) => value)));
    return legendItems.filter(({ seriesIdentifiers }) => seriesIdentifiers.some(({ key }) => lookup.has(key)));
  },
);
