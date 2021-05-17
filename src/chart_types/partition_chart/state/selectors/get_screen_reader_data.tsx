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
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { flatSlicesNames, HierarchyOfArrays } from '../../layout/utils/group_by_rollup';
import { Layer, PartitionSpec } from '../../specs';
import { partitionMultiGeometries } from './geometries';
import { getPartitionSpecs } from './get_partition_specs';
import { getTrees } from './tree';

/** @internal */
export interface LabelsInterface {
  label: string;
  valueText: number;
  depth: number;
  percentage: string;
}

/** @internal */
const getFlattenedLabels = (layers: Layer[], tree: HierarchyOfArrays, legendMaxDepth: number = 0) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return flatSlicesNames(layers, 0, tree).filter((val) => val.depth <= legendMaxDepth);
};

/**
 * @internal
 */
const getScreenReaderDataForPartitions = (
  specs: PartitionSpec[],
  legendMaxDepth: number,
  trees: { tree: HierarchyOfArrays }[],
) => {
  return specs.flatMap((spec) => getFlattenedLabels(spec.layers, trees[0].tree, legendMaxDepth));
};

/** @internal */
export const getScreenReaderDataSelector = createCachedSelector(
  [getPartitionSpecs, getSettingsSpecSelector, getTrees, partitionMultiGeometries],
  (specs, { legendMaxDepth }, trees) => {
    const lengthOfResults = getScreenReaderDataForPartitions(specs, legendMaxDepth, trees).length;
    // how to control how much is calculated
    return lengthOfResults > 20
      ? [
          {
            label: `There are ${lengthOfResults} data points in this chart`,
            depth: 0,
            valueText: lengthOfResults,
            percentage: 'N/A',
          },
        ]
      : getScreenReaderDataForPartitions(specs, legendMaxDepth, trees);
  },
)(getChartIdSelector);
