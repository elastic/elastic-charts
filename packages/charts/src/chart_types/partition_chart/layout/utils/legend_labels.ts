/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItemLabel } from '../../../../state/selectors/get_legend_items_labels';
import { Layer } from '../../specs';
import { CHILDREN_KEY, HIERARCHY_ROOT_KEY, HierarchyOfArrays } from './group_by_rollup';

/** @internal */
export function getLegendLabels(layers: Layer[], tree: HierarchyOfArrays, legendMaxDepth: number) {
  return flatSlicesNames(layers, 0, tree).filter(({ depth }) => depth <= legendMaxDepth);
}

function flatSlicesNames(
  layers: Layer[],
  depth: number,
  tree: HierarchyOfArrays,
  keys: Map<string, number> = new Map(),
): LegendItemLabel[] {
  if (tree.length === 0) {
    return [];
  }

  for (const [key, arrayNode] of tree) {
    // format the key with the layer formatter
    const layer = layers[depth - 1];
    const formatter = layer?.nodeLabel;
    const formattedValue = formatter ? formatter(key) : `${key}`;
    // preventing errors from external formatters
    if (formattedValue && formattedValue !== HIERARCHY_ROOT_KEY) {
      // save only the max depth, so we can compute the the max extension of the legend
      keys.set(formattedValue, Math.max(depth, keys.get(formattedValue) ?? 0));
    }

    const children = arrayNode[CHILDREN_KEY];
    flatSlicesNames(layers, depth + 1, children, keys);
  }
  return [...keys.keys()].map((k) => ({
    label: k,
    depth: keys.get(k) ?? 0,
  }));
}
