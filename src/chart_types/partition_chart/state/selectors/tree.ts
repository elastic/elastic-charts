/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import createCachedSelector from 're-reselect';

import { ChartTypes } from '../../..';
import { SpecTypes } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { getSpecsFromStore } from '../../../../state/utils';
import { configMetadata } from '../../layout/config/config';
import { childOrders, HierarchyOfArrays } from '../../layout/utils/group_by_rollup';
import { getHierarchyOfArrays } from '../../layout/viewmodel/hierarchy_of_arrays';
import { isSunburst, isTreemap } from '../../layout/viewmodel/viewmodel';
import { PartitionSpec } from '../../specs';

const getSpecs = (state: GlobalChartState) => state.specs;

/** @internal */
export const getTree = createCachedSelector(
  [getSpecs],
  (specs): HierarchyOfArrays => {
    const pieSpecs = getSpecsFromStore<PartitionSpec>(specs, ChartTypes.Partition, SpecTypes.Series);
    if (pieSpecs.length !== 1) {
      return [];
    }
    const { data, valueAccessor, layers } = pieSpecs[0];
    const layout = pieSpecs[0].config.partitionLayout ?? configMetadata.partitionLayout.dflt;
    const sorter = isTreemap(layout) || isSunburst(layout) ? childOrders.descending : null;
    return getHierarchyOfArrays(
      data,
      valueAccessor,
      [() => null, ...layers.map(({ groupByRollup }) => groupByRollup)],
      sorter,
    );
  },
)((state) => state.chartId);
