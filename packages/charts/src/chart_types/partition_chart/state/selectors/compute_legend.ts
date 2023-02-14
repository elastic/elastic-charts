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
import { Layer } from '../../specs';

/** @internal */
export const computeLegendSelector = createCustomCachedSelector(
  [getPartitionSpecs, getLegendConfigSelector, partitionMultiGeometries, getTrees],
  (specs, { flatLegend, legendMaxDepth, legendPosition }, geometries, trees): LegendItem[] =>
    trees.flatMap((tree) => {
      const useHierarchicalLegend = isHierarchicalLegend(flatLegend, legendPosition);
      const items = walkTree(specs[0].id, useHierarchicalLegend, tree.tree, specs[0].layers, 0);
      return [...items]
        .filter((d) => {
          const depth = d.item.depth ?? -1;
          if (d.item.childId === HIERARCHY_ROOT_KEY) {
            return false;
          }
          if (legendMaxDepth !== null && depth > legendMaxDepth) {
            return false;
          }
          return true;
        })
        .sort(
          specs[0].layout === PartitionLayout.waffle // waffle has inherent top to bottom descending order
            ? descendingValues
            : () => 0,
        )
        .map(({ item }) => item);
    }),
);

type LegendNode = { item: LegendItem; node: ArrayNode };

function descendingValues(aItem: LegendNode, bItem: LegendNode): number {
  return (aItem.item.depth ?? -1) - (bItem.item.depth ?? -1) || bItem.node[AGGREGATE_KEY] - aItem.node[AGGREGATE_KEY];
}

function walkTree(
  specId: SpecId,
  useHierarchicalLegend: boolean,
  tree: HierarchyOfArrays,
  layers: Layer[],
  depth: number,
  legendItems: Set<{ item: LegendItem; node: ArrayNode }> = new Set(),
) {
  if (tree.length === 0) {
    return [];
  }

  for (const [key, node] of tree) {
    const layer = layers[depth - 1];
    const formatter = layer?.nodeLabel ?? ((d: any) => `${d}`);

    const fill = layer?.shape?.fillColor ?? 'rgba(128, 0, 0, 0.5)';
    const fillColor = typeof fill === 'function' ? fill([key, node], tree) : fill;

    legendItems.add({
      item: {
        color: fillColor,
        childId: key,
        label: formatter(key),
        path: node[PATH_KEY],
        depth: useHierarchicalLegend ? node[DEPTH_KEY] - 1 : 0,
        seriesIdentifiers: [{ key, specId }],
        keys: [],
        defaultExtra: {
          raw: node[AGGREGATE_KEY],
          formatted: `${node[AGGREGATE_KEY]}`,
          legendSizingLabel: `${node[AGGREGATE_KEY]}`,
        },
      },
      node,
    });
    const children = node[CHILDREN_KEY];
    walkTree(specId, useHierarchicalLegend, children, layers, depth + 1, legendItems);
  }
  return legendItems;
}
