/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { getSpecsFromStore, getSpecFromStore } from '../../../../state/utils';
import { PartitionSpec } from '../../specs';

/** @internal */
export function getPartitionSpecs(state: GlobalChartState): PartitionSpec[] {
  return getSpecsFromStore<PartitionSpec>(state.specs, ChartType.Partition, SpecType.Series);
}

/** @internal */
export function getPartitionSpec(state: GlobalChartState): PartitionSpec | null {
  return getSpecFromStore<PartitionSpec, false>(state.specs, ChartType.Partition, SpecType.Series, false);
}
