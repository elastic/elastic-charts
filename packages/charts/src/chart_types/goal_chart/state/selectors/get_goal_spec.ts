/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SpecType } from '../../../../specs/spec_type';
import { GlobalChartState } from '../../../../state/global_chart_state';
import { getSpecFromStore } from '../../../../state/utils/get_spec_from_store';
import { ChartType } from '../../../chart_type';
import { GoalSpec } from '../../specs';

/** @internal */
export function getGoalSpecSelector(state: GlobalChartState): GoalSpec {
  return getSpecFromStore<GoalSpec, true>(state.specs, ChartType.Goal, SpecType.Series, true);
}
