/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAction } from '@reduxjs/toolkit';

import { CategoryKey } from '../../common/category';
import { SeriesIdentifier } from '../../common/series_id';

/** @public */
export type LegendPathElement = { index: number; value: CategoryKey };

/**
 * This is an array that defines a path for chart types characterized by hierarchical breakdown of the data, currently
 * partition charts. With partition charts,
 *   - element index 0 is the `groupBy` breakdown: a panel `index` number, and a stringified category `value`
 *      - if the chart is a singleton, ie. there's no trellising, it's `{index: 0, value: NULL_SMALL_MULTIPLES_KEY}`
 *   - element index 1 represents the singular root of a specific pie etc. chart `{index: 0, value: HIERARCHY_ROOT_KEY}`
 *   - element index 2 represents the primary breakdown categories within a pie/treemap/etc.
 *   - element index 3 the next level breakdown, if any (eg. a ring around the pie, ie. sunburst)
 *   etc.
 * @public
 */
export type LegendPath = LegendPathElement[];

/** @internal */
export interface ToggleDeselectSeriesAction {
  legendItemIds: SeriesIdentifier[];
  metaKey?: boolean;
}

/** @internal */
export const onLegendItemOverAction = createAction<LegendPath>('ON_LEGEND_ITEM_OVER');

/** @internal */
export const onLegendItemOutAction = createAction('ON_LEGEND_ITEM_OUT');

/** @internal */
export const onToggleDeselectSeriesAction = createAction(
  'ON_TOGGLE_DESELECT_SERIES',
  ({ legendItemIds, metaKey = false }: ToggleDeselectSeriesAction) => ({
    payload: {
      legendItemIds,
      metaKey,
    },
  }),
);
