/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AnchorPosition } from '../../components/portal/types';
import { GlobalChartState } from '../chart_state';

/** @internal */
export const getInternalTooltipAnchorPositionSelector = (state: GlobalChartState): AnchorPosition | null => {
  if (state.internalChartState) {
    return state.internalChartState.getTooltipAnchor(state);
  }
  return null;
};
