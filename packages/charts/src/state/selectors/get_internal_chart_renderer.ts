/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';
import type { ChartRenderer } from '../internal_chart_renderer';

/** @internal */
const chartRenderer: { current: ChartRenderer | null } = {
  current: null,
};

/** @internal */
export const getCurrentChartRenderer = () => chartRenderer.current;

/** @internal */
export const setCurrentChartRenderer = (cR: ChartRenderer) => {
  chartRenderer.current = cR;
};

/**
 * @internal
 */
export const getInternalChartRendererSelector = createCustomCachedSelector(
  [(state: GlobalChartState) => state.chartType],
  (chartType): ChartRenderer | null => (chartType ? chartRenderer.current : null),
);
