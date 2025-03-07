/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

import { getInternalChartStateSelector } from './get_internal_chart_state';
import type { GlobalChartState } from '../chart_state';

/** @internal */
export const InitStatus = Object.freeze({
  ParentSizeInvalid: 'ParentSizeInvalid' as const,
  SpecNotInitialized: 'SpecNotInitialized' as const,
  MissingChartType: 'MissingChartType' as const,
  ChartNotInitialized: 'ChartNotInitialized' as const,
  Initialized: 'Initialized' as const,
});

/** @internal */
export type InitStatus = $Values<typeof InitStatus>;

/** @internal */
export const getInternalIsInitializedSelector = (globalChartState: GlobalChartState): InitStatus => {
  const {
    parentDimensions: { width, height },
    specsInitialized,
  } = globalChartState;

  if (!specsInitialized) {
    return InitStatus.SpecNotInitialized;
  }

  const internalChartState = getInternalChartStateSelector(globalChartState);

  if (!internalChartState) {
    return InitStatus.MissingChartType;
  }

  if (width <= 0 || height <= 0) {
    return InitStatus.ParentSizeInvalid;
  }

  return internalChartState.isInitialized(globalChartState);
};
