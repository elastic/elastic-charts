/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isMosaic, isSunburst, isTreemap, isWaffle } from './viewmodel';
import { LegendItemExtraValues } from '../../../../common/legend';
import { SeriesKey } from '../../../../common/series_id';
import { Relation } from '../../../../common/text_utils';
import { LegendPath } from '../../../../state/actions/legend';
import { IndexedAccessorFn } from '../../../../utils/accessor';
import { Datum, ValueAccessor, ValueFormatter } from '../../../../utils/common';
import { Layer } from '../../specs';
import { PartitionLayout } from '../types/config_types';
import {
  aggregators,
  CHILDREN_KEY,
  groupByRollup,
  HIERARCHY_ROOT_KEY,
  HierarchyOfArrays,
  mapEntryValue,
  mapsToArrays,
  NodeSorter,
  Sorter,
} from '../utils/group_by_rollup';

function aggregateComparator(accessor: (v: any) => any, sorter: Sorter): NodeSorter {
  return (a, b) => sorter(accessor(a), accessor(b));
}

const ascending: Sorter = (a, b) => a - b;
const descending: Sorter = (a, b) => b - a;

const childOrders = {
  ascending,
  descending,
};

const descendingValueNodes = aggregateComparator(mapEntryValue, childOrders.descending);
const ascendingValueNodes = aggregateComparator(mapEntryValue, childOrders.ascending);

/**
 * @internal
 */
export function getHierarchyOfArrays(
  rawFacts: Relation,
  valueAccessor: ValueAccessor,
  groupByRollupAccessors: IndexedAccessorFn[],
  sortSpecs: (NodeSorter | null)[],
  innerGroups: LegendPath,
): HierarchyOfArrays {
  const aggregator = aggregators.sum;

  const facts = rawFacts.filter((n) => {
    const value = valueAccessor(n);
    return Number.isFinite(value) && value >= 0;
  });

  // don't render anything if the total, the width or height is not positive or zero
  if (facts.reduce((p: number, n) => aggregator.reducer(p, valueAccessor(n)), aggregator.identity()) <= 0) {
    return [];
  }

  // We can precompute things invariant of how the rectangle is divvied up.
  // By introducing `scale`, we no longer need to deal with the dichotomy of
  // size as data value vs size as number of pixels in the rectangle
  return mapsToArrays(groupByRollup(groupByRollupAccessors, valueAccessor, aggregator, facts), sortSpecs, innerGroups);
}

const sorter =
  (layout: PartitionLayout) =>
  ({ sortPredicate }: Layer, i: number) =>
    sortPredicate ||
    (isTreemap(layout) || isSunburst(layout) || isWaffle(layout)
      ? descendingValueNodes
      : isMosaic(layout)
        ? i === 2
          ? ascendingValueNodes
          : descendingValueNodes
        : null);

/** @internal */
export function partitionTree(
  data: Datum[],
  valueAccessor: ValueAccessor,
  layers: Layer[],
  layout: PartitionLayout,
  innerGroups: LegendPath,
) {
  return getHierarchyOfArrays(
    data,
    valueAccessor,
    [() => HIERARCHY_ROOT_KEY, ...layers.map(({ groupByRollup }) => groupByRollup)],
    [null, ...layers.map(sorter(layout))],
    innerGroups,
  );
}

/**
 * Creates flat extra value map from nested key path
 * @internal
 */
export function getExtraValueMap(
  layers: Layer[],
  valueFormatter: ValueFormatter,
  tree: HierarchyOfArrays,
  maxDepth: number,
  depth: number = 0,
  keys: Map<SeriesKey, LegendItemExtraValues> = new Map(),
): Map<SeriesKey, LegendItemExtraValues> {
  for (let i = 0; i < tree.length; i++) {
    const branch = tree[i];
    if (!branch) continue;
    const [key, arrayNode] = branch;
    const { value, path, [CHILDREN_KEY]: children } = arrayNode;
    const values: LegendItemExtraValues = new Map();
    const label = valueFormatter ? valueFormatter(value) : `${value}`;
    values.set(key, { label, value });
    keys.set(path.map(({ index }) => index).join('__'), values);
    if (depth < maxDepth) getExtraValueMap(layers, valueFormatter, children, maxDepth, depth + 1, keys);
  }
  return keys;
}
