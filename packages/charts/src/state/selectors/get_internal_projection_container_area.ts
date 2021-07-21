/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Dimensions } from '../../utils/dimensions';
import { GlobalChartState } from '../chart_state';

/** @internal */
export const getInternalProjectionContainerAreaSelector = (state: GlobalChartState): Dimensions => {
  if (state.internalChartState) {
    return state.internalChartState.getProjectionContainerArea(state);
  }
  return { width: 0, height: 0, left: 0, top: 0 };
};
