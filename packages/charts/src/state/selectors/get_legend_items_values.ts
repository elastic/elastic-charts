/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItemValues } from '../../common/legend';
import { SeriesKey } from '../../common/series_id';
import { GlobalChartState } from '../chart_state';

const EMPTY_ITEM_LIST = new Map<SeriesKey, LegendItemValues>();

/** @internal */
export const getLegendValuesSelector = (state: GlobalChartState): Map<SeriesKey, LegendItemValues> => {
  if (state.internalChartState) {
    return state.internalChartState.getLegendValues(state);
  }
  return EMPTY_ITEM_LIST;
};
