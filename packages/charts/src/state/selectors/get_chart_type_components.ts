/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalChartStateSelector } from './get_internal_chart_state';
import { GlobalChartState, BackwardRef } from '../chart_state';

type ChartRendererFn = (
  containerRef: BackwardRef,
  forwardStageRef: React.RefObject<HTMLCanvasElement>,
) => JSX.Element | null;

/** @internal */
export const getInternalChartRendererSelector = (state: GlobalChartState): ChartRendererFn => {
  const internalChartState = getInternalChartStateSelector(state);
  if (internalChartState) {
    return internalChartState.chartRenderer;
  }
  return () => null;
};
