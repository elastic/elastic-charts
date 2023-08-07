/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../../chart_types';
import { BulletGraphSpec } from '../../../chart_types/bullet_graph/spec';
import { SpecType } from '../../../specs';
import { GlobalChartState } from '../../../state/chart_state';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { getSpecFromStore } from '../../../state/utils';
import { Dimensions } from '../../../utils/dimensions';

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const chartSize = createCustomCachedSelector([getParentDimension], (container): Dimensions => {
  return { ...container };
});

/** @internal */
export function getBulletSpec(state: GlobalChartState): BulletGraphSpec {
  return getSpecFromStore<BulletGraphSpec, true>(state.specs, ChartType.BulletGraph, SpecType.Series, true);
}
