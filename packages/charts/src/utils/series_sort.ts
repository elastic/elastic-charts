/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SeriesIdentifier } from '../common/series_id';

/**
 * A compare function used to determine the order of the elements. It is expected to return
 * a negative value if first argument is less than second argument, zero if they're equal and a positive
 * value otherwise.
 * @public
 */
export type SeriesCompareFn = (siA: SeriesIdentifier, siB: SeriesIdentifier) => number;

const DEFAULT_SORTING_FN = () => 0; // this should cause no reorder, as [].sort is now a stable sort in browsers

/** @internal */
export const getRenderingCompareFn = (defaultSortFn: SeriesCompareFn = DEFAULT_SORTING_FN) => defaultSortFn;

/** @internal */
export const getLegendCompareFn = (defaultSortFn: SeriesCompareFn = DEFAULT_SORTING_FN) => defaultSortFn;

/** @internal */
export const getTooltipCompareFn = (defaultSortFn: SeriesCompareFn = DEFAULT_SORTING_FN) => defaultSortFn;
