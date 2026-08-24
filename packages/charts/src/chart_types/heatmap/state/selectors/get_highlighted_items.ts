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
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getHighlightedLegendPaths } from '../../../../state/selectors/get_highlighted_paths';

/** @internal */
export const getHighlightedItemsSelector = createCustomCachedSelector(
  [getHighlightedLegendPaths, computeLegendSelector],
  (highlightedPaths: LegendPath[], legendItems: LegendItem[]): LegendItem[] => {
    if (highlightedPaths.length === 0) return [];
    const lookup = new Set(highlightedPaths.flatMap((path) => path.map(({ value }) => value)));
    return legendItems.filter(({ seriesIdentifiers }) => seriesIdentifiers.some(({ key }) => lookup.has(key)));
  },
);
