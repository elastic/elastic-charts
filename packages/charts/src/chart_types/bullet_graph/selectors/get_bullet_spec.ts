/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BulletSpec } from '../../../chart_types/bullet_graph/spec';
import { ChartType } from '../../../chart_types/chart_type';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { GlobalChartState } from '../../../state/chart_state';
import { getSpecFromStore } from '../../../state/utils/get_spec_from_store';

/** @internal */

export function getBulletSpec(state: GlobalChartState): BulletSpec {
  return getSpecFromStore<BulletSpec, true>(state.specs, ChartType.Bullet, SpecType.Series, true);
}
