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

import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { flatSlicesNames, HierarchyOfArrays } from '../../layout/utils/group_by_rollup';
import { PartitionSpec } from '../../specs';
import { partitionMultiGeometries } from './geometries';
import { getPartitionSpecs } from './get_partition_specs';
import { getTrees } from './tree';

/** @internal */
export interface LabelsInterface {
  smTitle?: string;
  label: string;
  parentName: string | undefined;
  depth: number;
  percentage: string;
  value: number;
  valueText: string;
}

/**
 * @internal
 */
const getScreenReaderDataForPartitions = (specs: PartitionSpec[], trees: { tree: HierarchyOfArrays }[]) => {
  return specs.flatMap((spec) => flatSlicesNames(spec.layers, 0, trees[0].tree, spec.valueFormatter));
};

/** @internal */
export const getScreenReaderDataSelector = createCachedSelector(
  [getPartitionSpecs, getTrees, partitionMultiGeometries],
  (specs, trees) => {
    return getScreenReaderDataForPartitions(specs, trees);
  },
)(getChartIdSelector);
