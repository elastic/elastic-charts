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
import { MODEL_KEY } from '../../layout/config';
import {
  CHILDREN_KEY,
  DEPTH_KEY,
  HierarchyOfArrays,
  HIERARCHY_ROOT_KEY,
  STATISTICS_KEY,
} from '../../layout/utils/group_by_rollup';
import { Layer, PartitionSpec } from '../../specs';
import { partitionMultiGeometries } from './geometries';
import { getPartitionSpecs } from './get_partition_specs';
import { getTrees } from './tree';

interface LabelsInterface {
  fullFormattedName: string;
  valueText: number;
  depth: number;
  percentage: string;
}

// modifying the legend_labels.ts flatSliceName() to have a different return type
const flatLabelsNames = (layers: Layer[], depth: number, tree: HierarchyOfArrays, labels: LabelsInterface[] = []) => {
  if (tree.length === 0) return labels;
  for (let i = 0; i < tree.length; i++) {
    const branch = tree[i];
    const arrayNode = branch[1];
    const label = branch[0]; // instead of key

    // format the key with the layer formatter
    const layer = layers[depth - 1];
    const formatter = layer?.nodeLabel;
    let formattedValue = '';
    if (label != null) {
      formattedValue = formatter ? formatter(label) : `${label}`;
    }
    // preventing errors from external formatters
    if (formattedValue != null && formattedValue !== '' && formattedValue !== HIERARCHY_ROOT_KEY) {
      // save only the max depth, so we can compute the max extension of the legend
      const current: LabelsInterface = {
        fullFormattedName: formattedValue,
        depth: arrayNode[MODEL_KEY][DEPTH_KEY],
        valueText: arrayNode.value,
        percentage: `${Math.round((arrayNode.value / arrayNode[STATISTICS_KEY].globalAggregate) * 100)}%`,
      };
      labels.push(current);
    }
    const children = arrayNode[CHILDREN_KEY];
    flatLabelsNames(layers, depth + 1, children, labels);
  }
  return labels;
};

const getFlattenedLabels = (layers: Layer[], tree: HierarchyOfArrays, legendMaxDepth: number = 0) => {
  return flatLabelsNames(layers, 0, tree).filter(({ depth }) => depth <= legendMaxDepth);
};

/**
 * @internal
 */
const getScreenReaderDataForPartitions = (
  specs: PartitionSpec[],
  legendMaxDepth: number,
  trees: { tree: HierarchyOfArrays }[],
) => {
  const labels: LabelsInterface[] = specs.flatMap((spec) =>
    getFlattenedLabels(spec.layers, trees[0].tree, legendMaxDepth),
  );
  return labels;
};

/** @internal */
export const getScreenReaderDataSelector = createCachedSelector(
  [getPartitionSpecs, getSettingsSpecSelector, getTrees, partitionMultiGeometries],
  (specs, { legendMaxDepth }, trees) => {
    getScreenReaderDataForPartitions(specs, legendMaxDepth, trees);
  },
)(getChartIdSelector);
