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
import { getSpecFromStore } from '../../../state/utils';

/** @internal */

export function getBulletSpec(state: GlobalChartState): BulletGraphSpec {
  return getSpecFromStore<BulletGraphSpec, true>(state.specs, ChartType.BulletGraph, SpecType.Series, true);
}
