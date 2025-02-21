/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values as Values } from 'utility-types';

import type { LegendPath } from '../../../../state/actions/legend';
import type { DataName, QuadViewModel } from '../types/viewmodel_types';

type LegendStrategyFn = (legendPath: LegendPath) => (partialShape: { path: LegendPath; dataName: DataName }) => boolean;

const legendStrategies: Record<LegendStrategy, LegendStrategyFn> = {
  node:
    (legendPath) =>
    ({ path }) =>
      // highlight exact match in the path only
      legendPath.length === path.length &&
      legendPath.every(({ index, value }, i) => index === path[i]?.index && value === path[i]?.value),

  path:
    (legendPath) =>
    ({ path }) =>
      // highlight members of the exact path; ie. exact match in the path, plus all its ancestors
      path.every(({ index, value }, i) => index === legendPath[i]?.index && value === legendPath[i]?.value),

  keyInLayer:
    (legendPath) =>
    ({ path, dataName }) =>
      // highlight all identically named items which are within the same depth (ring) as the hovered legend depth
      legendPath.length === path.length && dataName === legendPath.at(-1)?.value,

  key:
    (legendPath) =>
    ({ dataName }) =>
      // highlight all identically named items, no matter where they are
      dataName === legendPath.at(-1)?.value,

  nodeWithDescendants:
    (legendPath) =>
    ({ path }) =>
      // highlight exact match in the path, and everything that is its descendant in that branch
      legendPath.every(({ index, value }, i) => index === path[i]?.index && value === path[i]?.value),

  pathWithDescendants:
    (legendPath) =>
    ({ path }) =>
      // highlight exact match in the path, and everything that is its ancestor, or its descendant in that branch
      legendPath
        .slice(0, path.length)
        .every(({ index, value }, i) => index === path[i]?.index && value === path[i]?.value),
};

/** @public */
export const LegendStrategy = Object.freeze({
  /**
   * Highlight the specific node(s) that the legend item stands for.
   */
  Node: 'node' as const,
  /**
   * Highlight members of the exact path; ie. like `Node`, plus all its ancestors
   */
  Path: 'path' as const,
  /**
   * Highlight all identically named (labelled) items within the tree layer (depth or ring) of the specific node(s) that the legend item stands for
   */
  KeyInLayer: 'keyInLayer' as const,
  /**
   * Highlight all identically named (labelled) items, no matter where they are
   */
  Key: 'key' as const,
  /**
   * Highlight the specific node(s) that the legend item stands for, plus all descendants
   */
  NodeWithDescendants: 'nodeWithDescendants' as const,
  /**
   * Highlight the specific node(s) that the legend item stands for, plus all ancestors and descendants
   */
  PathWithDescendants: 'pathWithDescendants' as const,
});

/** @public */
export type LegendStrategy = Values<typeof LegendStrategy>;

const defaultStrategy: LegendStrategy = LegendStrategy.Path;

/** @internal */
export function highlightedGeoms(
  legendStrategy: LegendStrategy | undefined,
  flatLegend: boolean | undefined,
  quadViewModel: QuadViewModel[],
  highlightedLegendItemPath: LegendPath,
) {
  return quadViewModel.filter(legendStrategies[legendStrategy ?? defaultStrategy](highlightedLegendItemPath));
}
