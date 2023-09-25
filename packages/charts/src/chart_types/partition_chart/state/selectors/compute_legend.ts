/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPartitionSpecs } from './get_partition_specs';
import { getTrees } from './tree';
import { RGBATupleToString } from '../../../../common/color_library_wrappers';
import { Colors } from '../../../../common/colors';
import { LegendItem } from '../../../../common/legend';
import { SeriesIdentifier } from '../../../../common/series_id';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLegendConfigSelector } from '../../../../state/selectors/get_legend_config_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
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

function compareLegendItemNames(aItem: LegendNode, bItem: LegendNode, locale: string): number {
  return aItem.item.label.localeCompare(bItem.item.label, locale);
}

function compareDescendingLegendItemValues(aItem: LegendNode, bItem: LegendNode): number {
  return (aItem.item.depth ?? -1) - (bItem.item.depth ?? -1) || bItem.node[AGGREGATE_KEY] - aItem.node[AGGREGATE_KEY];
}

/** @internal */
export const computeLegendSelector = createCustomCachedSelector(
  [getSettingsSpecSelector, getPartitionSpecs, getLegendConfigSelector, getTrees],
  (settings, [spec], { flatLegend, legendMaxDepth, legendPosition }, trees): LegendItem[] => {
    if (!spec) return [];

    const sortingFn = flatLegend && settings.legendSort;
    const { locale } = settings;
    return trees.flatMap((tree) => {
      const customSortingFn = sortingFn
        ? (aItem: LegendNode, bItem: LegendNode) =>
            sortingFn(
              {
                smAccessorValue: tree.smAccessorValue,
                specId: aItem.item.seriesIdentifiers[0]?.specId,
                key: aItem.item.seriesIdentifiers[0]?.key,
              } as SeriesIdentifier,
              {
                smAccessorValue: tree.smAccessorValue,
                specId: bItem.item.seriesIdentifiers[0]?.specId,
                key: bItem.item.seriesIdentifiers[0]?.key,
              } as SeriesIdentifier,
            )
        : undefined;
      const useHierarchicalLegend = isHierarchicalLegend(flatLegend, legendPosition);
      const { valueFormatter } = spec;
      const items = walkTree(spec.id, useHierarchicalLegend, valueFormatter, tree.tree, spec.layers, 0);
      return items
        .filter((d) => {
          const depth = d.item.depth ?? -1;
          // remove hierarchy root
          if (d.item.childId === HIERARCHY_ROOT_KEY) {
            return false;
          }
          return depth < legendMaxDepth;
        })
        .sort(
          customSortingFn ??
            (spec.layout === PartitionLayout.waffle // waffle has inherent top to bottom descending order
              ? compareDescendingLegendItemValues
              : isLinear(spec.layout) // icicle/flame are sorted by name
              ? (a, b) => compareLegendItemNames(a, b, locale)
              : () => 0), // all others are sorted by hierarchy
        )
        .map(({ item }) => item);
    });
  },
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

    const fill = layer?.shape?.fillColor ?? RGBATupleToString(Colors.DarkOpaqueRed.rgba);
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
