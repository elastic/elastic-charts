/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPartitionSpecs } from './get_partition_specs';
import { ChartType } from '../../..';
import { getPredicateFn } from '../../../../common/predicate';
import {
  DEFAULT_SM_PANEL_PADDING,
  GroupByAccessor,
  GroupBySpec,
  SmallMultiplesSpec,
  SmallMultiplesStyle,
} from '../../../../specs';
import { SpecType } from '../../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getSmallMultiplesSpecs } from '../../../../state/selectors/get_small_multiples_spec';
import { getSpecs } from '../../../../state/selectors/get_specs';
import { getSpecsFromStore } from '../../../../state/utils/get_specs_from_store';
import { Datum } from '../../../../utils/common';
import { HierarchyOfArrays, NULL_SMALL_MULTIPLES_KEY } from '../../layout/utils/group_by_rollup';
import { partitionTree } from '../../layout/viewmodel/hierarchy_of_arrays';
import { PartitionSpec } from '../../specs';

const getGroupBySpecs = createCustomCachedSelector([getSpecs], (specs) =>
  getSpecsFromStore<GroupBySpec>(specs, ChartType.Global, SpecType.IndexOrder),
);

/** @internal */
export type StyledTree = {
  smAccessorValue: ReturnType<GroupByAccessor>;
  name: string;
  style: SmallMultiplesStyle;
  tree: HierarchyOfArrays;
};

function getTreesForSpec(
  spec: PartitionSpec,
  smSpecs: SmallMultiplesSpec[],
  groupBySpecs: GroupBySpec[],
  locale: string,
): StyledTree[] {
  const { layout, data, valueAccessor, layers, smallMultiples: smId } = spec;
  const smSpec = smSpecs.find((s) => s.id === smId);
  const smStyle: SmallMultiplesStyle = {
    horizontalPanelPadding: smSpec
      ? smSpec.style?.horizontalPanelPadding ?? DEFAULT_SM_PANEL_PADDING
      : { outer: 0, inner: 0 },
    verticalPanelPadding: smSpec
      ? smSpec.style?.verticalPanelPadding ?? DEFAULT_SM_PANEL_PADDING
      : { outer: 0, inner: 0 },
  };
  const groupBySpec = groupBySpecs.find(
    (s) => s.id === smSpec?.splitHorizontally || s.id === smSpec?.splitVertically || s.id === smSpec?.splitZigzag,
  );

  if (groupBySpec) {
    const { by, sort, format = (name) => String(name) } = groupBySpec;
    const accessorSpec = { id: spec.id, chartType: spec.chartType, specType: SpecType.Series };
    const groups = data.reduce((map: Map<ReturnType<GroupByAccessor>, Datum[]>, next) => {
      const groupingValue = by(accessorSpec, next);
      const preexistingGroup = map.get(groupingValue);
      const group = preexistingGroup ?? [];
      if (!preexistingGroup) map.set(groupingValue, group);
      group.push(next);
      return map;
    }, new Map<string, HierarchyOfArrays>());
    return [...groups].sort(getPredicateFn(sort, locale)).map(([groupKey, subData], innerIndex) => ({
      name: format(groupKey),
      smAccessorValue: groupKey,
      style: smStyle,
      tree: partitionTree(subData, valueAccessor, layers, layout, [{ index: innerIndex, value: String(groupKey) }]),
    }));
  } else {
    return [
      {
        name: '',
        smAccessorValue: '',
        style: smStyle,
        tree: partitionTree(data, valueAccessor, layers, layout, [
          {
            index: 0,
            value: NULL_SMALL_MULTIPLES_KEY,
          },
        ]),
      },
    ];
  }
}

/** @internal */
export const getTrees = createCustomCachedSelector(
  [getPartitionSpecs, getSmallMultiplesSpecs, getGroupBySpecs, getSettingsSpecSelector],
  ([spec], smallMultiplesSpecs, groupBySpecs, { locale }): StyledTree[] =>
    spec ? getTreesForSpec(spec, smallMultiplesSpecs, groupBySpecs, locale) : [],
);
