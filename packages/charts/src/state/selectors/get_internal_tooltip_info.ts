/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TooltipInfo } from '../../components/tooltip/types';
import { GlobalChartState } from '../global_chart_state';

/** @internal */
export const getInternalTooltipInfoSelector = (state: GlobalChartState): TooltipInfo | undefined => {
  if (state.internalChartState) {
    return state.internalChartState.getTooltipInfo(state);
  }
};
