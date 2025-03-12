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
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

const EMPTY_ITEM_LIST = new Map<SeriesKey, LegendItemExtraValues>();

/** @internal */
export const getLegendExtraValuesSelector = createCustomCachedSelector(
  [(globalChartState: GlobalChartState) => globalChartState, getInternalChartStateSelector],
  (globalChartState, internalChartState): Map<SeriesKey, LegendItemExtraValues> => {
    if (internalChartState) {
      return internalChartState.getLegendExtraValues(globalChartState);
    }
    return EMPTY_ITEM_LIST;
  },
);
