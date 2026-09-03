/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeLegendSelector } from './compute_legend';
import type { LegendItem } from '../../../../common/legend';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getHighlightedLegendPath } from '../../../../state/selectors/get_highlighted_paths';

/** @internal */
export const getHighlightedLegendItemSelector = createCustomCachedSelector(
  [getHighlightedLegendPath, computeLegendSelector],
  (highlightedLegendPath, legendItems): LegendItem | undefined => {
    if (highlightedLegendPath && highlightedLegendPath.length > 0) {
      const lookup = new Set(highlightedLegendPath.map(({ value }) => value));
      return legendItems.find(({ seriesIdentifiers }) => seriesIdentifiers.some(({ key }) => lookup.has(key)));
    }
  },
);
