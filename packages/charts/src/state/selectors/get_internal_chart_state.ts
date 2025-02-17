/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChartSelectors } from '../chart_selectors';
import type { GlobalChartState } from '../chart_state';

/** @internal */
const chartSelectors: { current: ChartSelectors | null } = {
  current: null,
};

/** @internal */
export const setCurrentChartSelectors = (cS: ChartSelectors | null) => {
  chartSelectors.current = cS;
};

/** @internal */
export const getInternalChartStateSelector = (state: GlobalChartState) => state && chartSelectors.current;
