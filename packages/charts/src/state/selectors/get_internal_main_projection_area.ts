/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalChartStateSelector } from './get_internal_chart_state';
import type { Dimensions } from '../../utils/dimensions';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export const getInternalMainProjectionAreaSelector = createCustomCachedSelector(
  [(globalChartState: GlobalChartState) => globalChartState, getInternalChartStateSelector],
  (globalChartState, internalChartState): Dimensions => {
    if (internalChartState) {
      return internalChartState.getMainProjectionArea(globalChartState);
    }
    return { width: 0, height: 0, left: 0, top: 0 };
  },
);
