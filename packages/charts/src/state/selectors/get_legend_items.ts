/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItem } from '../../common/legend';
import { GlobalChartState } from '../chart_state';

const EMPTY_LEGEND_LIST: LegendItem[] = [];

/** @internal */
export const getLegendItemsSelector = (state: GlobalChartState): LegendItem[] => {
  if (state.internalChartState) {
    return state.internalChartState.getLegendItems(state);
  }
  return EMPTY_LEGEND_LIST;
};
