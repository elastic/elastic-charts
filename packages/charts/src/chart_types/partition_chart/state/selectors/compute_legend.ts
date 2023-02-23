/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { partitionMultiGeometries } from './geometries';
import { getPartitionSpecs } from './get_partition_specs';
import { getTrees } from './tree';
import { LegendItem } from '../../../../common/legend';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLegendConfigSelector } from '../../../../state/selectors/get_legend_config_selector';
import { isNil } from '../../../../utils/common';
import { SpecId } from '../../../../utils/ids';
import { isHierarchicalLegend } from '../../../../utils/legend';
import { PartitionLayout } from '../../layout/types/config_types';
import {
  AGGREGATE_KEY,
  ArrayNode,
  CHILDREN_KEY,
  DEPTH_KEY,
  HIERARCHY_ROOT_KEY,
  HierarchyOfArrays,
  PATH_KEY,
} from '../../layout/utils/group_by_rollup';
import { isLinear } from '../../layout/viewmodel/viewmodel';
import { Layer, PartitionSpec } from '../../specs';

function compareLegendItemNames(aItem: LegendNode, bItem: LegendNode): number {
  const a = aItem.item.label;
  const b = bItem.item.label;
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareDescendingLegendItemValues(aItem: LegendNode, bItem: LegendNode): number {
  return (aItem.item.depth ?? -1) - (bItem.item.depth ?? -1) || bItem.node[AGGREGATE_KEY] - aItem.node[AGGREGATE_KEY];
}

/** @internal */
export const computeLegendSelector = createCustomCachedSelector(
  [getPartitionSpecs, getLegendConfigSelector, partitionMultiGeometries, getTrees],
  (specs, { flatLegend, legendMaxDepth, legendPosition }, geometries, trees): LegendItem[] =>
    trees.flatMap((tree) => {
      const useHierarchicalLegend = isHierarchicalLegend(flatLegend, legendPosition);
      const { valueFormatter } = specs[0];
      const items = walkTree(specs[0].id, useHierarchicalLegend, valueFormatter, tree.tree, specs[0].layers, 0);
      return [...items.values()]
        .filter((d) => {
          const depth = d.item.depth ?? -1;
          // remove hierarchy root
          if (d.item.childId === HIERARCHY_ROOT_KEY) {
            return false;
          }
          return depth < legendMaxDepth;
        })
        .sort(
          specs[0].layout === PartitionLayout.waffle // waffle has inherent top to bottom descending order
            ? compareDescendingLegendItemValues
            : isLinear(specs[0].layout) // icicle/flame are sorted by name
            ? compareLegendItemNames
            : () => 0, // all others are sorted by hierarchy
        )
        .map(({ item }) => item);
    }),
);

type LegendNode = { item: LegendItem; node: ArrayNode };

function walkTree(
  specId: SpecId,
  useHierarchicalLegend: boolean,
  valueFormatter: PartitionSpec['valueFormatter'],
  tree: HierarchyOfArrays,
  layers: Layer[],
  depth: number,
  uniqueNames: Set<string> = new Set(),
  legendItems: Array<{ item: LegendItem; node: ArrayNode }> = [],
): { item: LegendItem; node: ArrayNode }[] {
  if (tree.length === 0) {
    return legendItems;
  }

  for (const [key, node] of tree) {
    const layer = layers[depth - 1];
    const formatter = layer?.nodeLabel ?? ((d) => `${d}`);

    const fill = layer?.shape?.fillColor ?? 'rgba(128, 0, 0, 0.5)';
    const fillColor = typeof fill === 'function' ? fill(key, node.sortIndex, node, tree) : fill;
    const label = formatter(key);
    const joinedPath = node[PATH_KEY].map((d) => d.value).join('##');
    const uniqueKey = `${depth}--${joinedPath}--${label}--${fillColor}--${node[AGGREGATE_KEY]}`;
    if (!isNil(key) && !uniqueNames.has(uniqueKey)) {
      legendItems.push({
        item: {
          color: fillColor,
          childId: key,
          label,
          path: node[PATH_KEY],
          depth: node[DEPTH_KEY] - 1,
          seriesIdentifiers: [{ key, specId }],
          keys: [],
          defaultExtra: {
            raw: node[AGGREGATE_KEY],
            formatted: valueFormatter(node[AGGREGATE_KEY]),
            legendSizingLabel: `${node[AGGREGATE_KEY]}`,
          },
        },
        node,
      });
      uniqueNames.add(uniqueKey);
    }
    const children = node[CHILDREN_KEY];
    walkTree(specId, useHierarchicalLegend, valueFormatter, children, layers, depth + 1, uniqueNames, legendItems);
  }
  return legendItems;
}
