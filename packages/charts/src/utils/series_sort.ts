/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SeriesIdentifier } from '../common/series_id';
import { SortSeriesByConfig } from '../specs/settings';

/**
 * A compare function used to determine the order of the elements. It is expected to return
 * a negative value if first argument is less than second argument, zero if they're equal and a positive
 * value otherwise.
 * @public
 */
export type SeriesCompareFn = (siA: SeriesIdentifier, siB: SeriesIdentifier) => number;

/** @internal */
export const DEFAULT_SORTING_FN = () => {
  return 0;
};

/** @internal */
export function getRenderingCompareFn(
  sortSeriesBy?: SeriesCompareFn | SortSeriesByConfig,
  defaultSortFn?: SeriesCompareFn,
): SeriesCompareFn {
  return getCompareFn('rendering', sortSeriesBy, defaultSortFn);
}

/** @internal */
export function getLegendCompareFn(
  sortSeriesBy?: SeriesCompareFn | SortSeriesByConfig,
  defaultSortFn?: SeriesCompareFn,
): SeriesCompareFn {
  return getCompareFn('legend', sortSeriesBy, defaultSortFn);
}

/** @internal */
export function getTooltipCompareFn(
  sortSeriesBy?: SeriesCompareFn | SortSeriesByConfig,
  defaultSortFn?: SeriesCompareFn,
): SeriesCompareFn {
  return getCompareFn('tooltip', sortSeriesBy, defaultSortFn);
}

function getCompareFn(
  aspect: keyof SortSeriesByConfig,
  sortSeriesBy?: SeriesCompareFn | SortSeriesByConfig,
  defaultSortFn: SeriesCompareFn = DEFAULT_SORTING_FN,
): SeriesCompareFn {
  if (typeof sortSeriesBy === 'object') {
    return sortSeriesBy[aspect] ?? sortSeriesBy.default ?? defaultSortFn;
  }
  return sortSeriesBy ?? defaultSortFn;
}
