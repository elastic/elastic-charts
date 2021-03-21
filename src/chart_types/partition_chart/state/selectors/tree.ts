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
import { getPredicateFn } from '../../../../common/predicate';
import { GroupByAccessor, GroupBySpec, SmallMultiplesSpec, SpecTypes } from '../../../../specs';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSpecs } from '../../../../state/selectors/get_settings_specs';
import { getSmallMultiplesSpecs } from '../../../../state/selectors/get_small_multiples_spec';
import { getSpecsFromStore } from '../../../../state/utils';
import { Datum } from '../../../../utils/common';
import { configMetadata } from '../../layout/config';
import { HierarchyOfArrays } from '../../layout/utils/group_by_rollup';
import { partitionTree } from '../../layout/viewmodel/hierarchy_of_arrays';
import { PartitionSpec } from '../../specs';
import { getPartitionSpecs } from './get_partition_specs';

const getGroupBySpecs = createCachedSelector([getSpecs], (specs) =>
  getSpecsFromStore<GroupBySpec>(specs, ChartTypes.Global, SpecTypes.IndexOrder),
)(getChartIdSelector);

/** @internal */
export type NamedTree = { name: string | number; tree: HierarchyOfArrays };

function getTreesForSpec(spec: PartitionSpec, smSpecs: SmallMultiplesSpec[], groupBySpecs: GroupBySpec[]): NamedTree[] {
  const { data, valueAccessor, layers, config, smallMultiples: smId } = spec;
  const smallMultiplesSpec = smSpecs.find((s) => s.id === smId);
  const groupBySpec = groupBySpecs.find(
    (s) =>
      s.id === smallMultiplesSpec?.splitHorizontally ||
      s.id === smallMultiplesSpec?.splitVertically ||
      s.id === smallMultiplesSpec?.splitZigzag,
  );

  if (groupBySpec) {
    const { by, sort, format = (name) => String(name) } = groupBySpec;
    const accessorSpec = { id: spec.id, chartType: spec.chartType, specType: SpecTypes.Series };
    const groups = data.reduce((map: Map<ReturnType<GroupByAccessor>, Datum[]>, next) => {
      const groupingValue = by(accessorSpec, next);
      const preexistingGroup = map.get(groupingValue);
      const group = preexistingGroup ?? [];
      if (!preexistingGroup) map.set(groupingValue, group);
      group.push(next);
      return map;
    }, new Map<string, HierarchyOfArrays>());
    return Array.from(groups)
      .sort(getPredicateFn(sort))
      .map(([groupKey, subData]) => ({
        name: format(groupKey),
        tree: partitionTree(
          subData,
          valueAccessor,
          layers,
          configMetadata.partitionLayout.dflt,
          config.partitionLayout,
        ),
      }));
  } else {
    return [
      {
        name: '',
        tree: partitionTree(data, valueAccessor, layers, configMetadata.partitionLayout.dflt, config.partitionLayout),
      },
    ];
  }
}

/** @internal */
export const getTrees = createCachedSelector(
  [getPartitionSpecs, getSmallMultiplesSpecs, getGroupBySpecs],
  (partitionSpecs, smallMultiplesSpecs, groupBySpecs): NamedTree[] =>
    partitionSpecs.length > 0 ? getTreesForSpec(partitionSpecs[0], smallMultiplesSpecs, groupBySpecs) : [], // singleton!
)(getChartIdSelector);
