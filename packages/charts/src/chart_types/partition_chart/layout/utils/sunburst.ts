/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ArrayEntry, childrenAccessor, HierarchyOfArrays } from './group_by_rollup';
import { Origin } from '../../../../common/geometry';
import { Part } from '../../../../common/text_utils';

/** @internal */
export function sunburst(
  outerNodes: HierarchyOfArrays,
  areaAccessor: (e: ArrayEntry) => number,
  { x0: outerX0, y0: outerY0 }: Origin,
  clockwiseSectors: boolean,
  specialFirstInnermostSector: boolean,
  heightStep: number = 1,
): Array<Part> {
  const result: Array<Part> = [];
  const laySubtree = (nodes: HierarchyOfArrays, { x0, y0 }: Origin, depth: number) => {
    let currentOffsetX = x0;
    const nodeCount = nodes.length;
    for (let i = 0; i < nodeCount; i++) {
      const index = clockwiseSectors ? i : nodeCount - i - 1;
      const node = nodes[depth === 1 && specialFirstInnermostSector ? (index + 1) % nodeCount : index];
      const area = areaAccessor(node);
      result.push({ node, x0: currentOffsetX, y0, x1: currentOffsetX + area, y1: y0 + heightStep });
      const children = childrenAccessor(node);
      if (children.length > 0) {
        laySubtree(children, { x0: currentOffsetX, y0: y0 + heightStep }, depth + 1);
      }
      currentOffsetX += area;
    }
  };
  laySubtree(outerNodes, { x0: outerX0, y0: outerY0 }, 0);
  return result;
}
