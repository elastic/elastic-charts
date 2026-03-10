/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalChartStateSelector } from './get_internal_chart_state';
import type { LegendItemExtraValues } from '../../common/legend';
import type { SeriesKey } from '../../common/series_id';
import { EMPTY_LEGEND_ITEM_EXTRA_VALUES } from '../chart_selectors';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export const getLegendExtraValuesSelector = createCustomCachedSelector(
  [(globalChartState: GlobalChartState) => globalChartState, getInternalChartStateSelector],
  (globalChartState, internalChartState): ReadonlyMap<SeriesKey, LegendItemExtraValues> => {
    if (internalChartState) {
      return internalChartState.getLegendExtraValues(globalChartState);
    }
    return EMPTY_LEGEND_ITEM_EXTRA_VALUES;
  },
);
