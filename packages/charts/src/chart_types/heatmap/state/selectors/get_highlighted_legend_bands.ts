/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getColorScale } from './get_color_scale';
import { getHighlightedLegendItemSelector } from './get_highlighted_legend_item';

/** @internal */
export const getHighlightedLegendBandsSelector = createCustomCachedSelector(
  [getHighlightedLegendItemSelector, getColorScale],
  (highlightedLegendItem, { bands }): Array<[start: number, end: number]> => {
    if (!highlightedLegendItem) return [];
    // instead of using the specId, each legend item is associated with an unique band label
    return bands.filter(({ label }) => highlightedLegendItem.label === label).map(({ start, end }) => [start, end]);
  },
);
