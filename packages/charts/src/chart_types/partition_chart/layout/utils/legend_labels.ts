/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { HierarchyOfArrays, ArrayNode } from './group_by_rollup';
import { CHILDREN_KEY, HIERARCHY_ROOT_KEY, PATH_KEY, NULL_SMALL_MULTIPLES_KEY, AGGREGATE_KEY } from './group_by_rollup';
import type { LegendItemLabel } from '../../../../state/selectors/get_legend_items_labels';
import type { ValueFormatter } from '../../../../utils/common';
import type { Layer } from '../../specs';

/** @internal */
export function getLegendLabelsAndValue(
  layers: Layer[],
  tree: HierarchyOfArrays,
  legendMaxDepth: number,
  // if used the resulting label will be concatenated with the formatted value, use () => '' to avoid that
  valueFormatter: ValueFormatter,
): LegendItemLabel[] {
  return flatSlicesNames(layers, 0, tree, valueFormatter).filter(({ depth }) => depth <= legendMaxDepth);
}

/** @internal */
function getArrayNodeKey(arrayNode: ArrayNode): string {
  return arrayNode[PATH_KEY].reduce<string>((acc, { value, index }) => {
    if (value === HIERARCHY_ROOT_KEY || value === NULL_SMALL_MULTIPLES_KEY) return acc;
    return `${acc}(${index}):${value}__`;
  }, '__');
}

function flatSlicesNames(
  layers: Layer[],
  depth: number,
  tree: HierarchyOfArrays,
  valueFormatter: ValueFormatter,
  keys: Map<string, string> = new Map(),
  depths: Map<string, number> = new Map(),
): LegendItemLabel[] {
  if (tree.length === 0) {
    return [];
  }

  for (const [key, arrayNode] of tree) {
    // format the key with the layer formatter
    const layer = layers[depth - 1];
    const formatter = layer?.nodeLabel;
    const formattedKey = formatter ? formatter(key) : `${key}`;
    // preventing errors from external formatters
    if (formattedKey && formattedKey !== HIERARCHY_ROOT_KEY) {
      // Node key must be unique for each node in the tree
      const nodeKey = getArrayNodeKey(arrayNode);
      // save only the max depth, so we can compute the the max extension of the legend
      depths.set(nodeKey, depth);

      const formattedValue = valueFormatter(arrayNode[AGGREGATE_KEY]);
      keys.set(nodeKey, `${formattedKey}${formattedValue}`);
    }

    const children = arrayNode[CHILDREN_KEY];
    flatSlicesNames(layers, depth + 1, children, valueFormatter, keys, depths);
  }

  return [...depths.keys()].map((key) => ({
    label: keys.get(key) ?? '',
    depth: depths.get(key) ?? 0,
  }));
}
