/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalChartStateSelector } from './get_internal_chart_state';
import { Dimensions } from '../../utils/dimensions';
import { GlobalChartState } from '../chart_state';

/** @internal */
export const getInternalProjectionContainerAreaSelector = (state: GlobalChartState): Dimensions => {
  const internalChartState = getInternalChartStateSelector(state);
  if (internalChartState) {
    return internalChartState.getProjectionContainerArea(state);
  }
  return { width: 0, height: 0, left: 0, top: 0 };
};
