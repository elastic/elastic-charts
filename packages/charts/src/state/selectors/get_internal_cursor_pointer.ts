/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CSSProperties } from 'react';

import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { GlobalChartState } from '../chart_state';

/** @internal */
export const getInternalPointerCursor = (state: GlobalChartState): CSSProperties['cursor'] => {
  return state.internalChartState?.getPointerCursor(state) ?? DEFAULT_CSS_CURSOR;
};
