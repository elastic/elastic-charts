/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

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
export const getIsInitializedSelector = createCustomCachedSelector(
  [
    (state: GlobalChartState) => state.specsInitialized,
    (state: GlobalChartState) => state.parentDimensions.width,
    (state: GlobalChartState) => state.parentDimensions.height,
  ],
  (specsInitialized, width, height): InitStatus => {
    if (!specsInitialized) {
      return InitStatus.SpecNotInitialized;
    }

    if (width <= 0 || height <= 0) {
      return InitStatus.ParentSizeInvalid;
    }

    return InitStatus.MissingChartType;
  },
);
