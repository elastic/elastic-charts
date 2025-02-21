/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getChartContainerDimensionsSelector } from './get_chart_container_dimensions';
import { getInternalChartStateSelector } from './get_internal_chart_state';
import { GlobalChartState } from '../chart_state';
import { DebugState } from '../types';

/** @internal */
export const getDebugStateSelector = (state: GlobalChartState): DebugState => {
  const internalChartState = getInternalChartStateSelector(state);
  if (internalChartState) {
    const { height, width } = getChartContainerDimensionsSelector(state);
    if (height * width > 0) {
      return internalChartState.getDebugState(state);
    }
  }
  return {};
};
