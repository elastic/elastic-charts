/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../chart_state';

/** @internal */
export const getChartTypeDescriptionSelector = (state: GlobalChartState): string => {
  if (state.internalChartState) {
    return state.internalChartState.getChartTypeDescription(state);
  }
  // need to return something so there is always a string returned
  return 'unknown chart type';
};
