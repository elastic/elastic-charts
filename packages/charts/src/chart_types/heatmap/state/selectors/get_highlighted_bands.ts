/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getColorScale } from './get_color_scale';
import { getHighlightedItemsSelector } from './get_highlighted_items';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import type { GenericDomain } from '../../../../utils/domain';

/** @internal */
export const getHighlightedBandsSelector = createCustomCachedSelector(
  [getHighlightedItemsSelector, getColorScale],
  (highlightedItems, { bands }): Array<GenericDomain> => {
    if (highlightedItems.length === 0) return [];
    const labels = new Set(
      highlightedItems.flatMap(({ seriesIdentifiers }) => seriesIdentifiers.map(({ key }) => key)),
    );
    return bands.filter(({ label }) => labels.has(label)).map(({ start, end }) => [start, end]);
  },
);
