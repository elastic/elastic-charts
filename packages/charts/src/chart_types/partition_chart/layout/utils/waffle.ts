/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CHILDREN_KEY, HierarchyOfArrays } from './group_by_rollup';
import { Part } from '../../../../common/text_utils';

// 10 x 10 grid for 100 cells ie. one cell is 1%
const rowCount = 10;
const columnCount = 10;

/** @internal */
export function waffle(
  tree: HierarchyOfArrays,
  totalValue: number,
  {
    x0: outerX0,
    y0: outerY0,
    width: outerWidth,
    height: outerHeight,
  }: { x0: number; y0: number; width: number; height: number },
): Array<Part> {
  const root = tree[0];
  if (!root || !root[1]) return [];

  const size = Math.min(outerWidth, outerHeight);
  const widthOffset = Math.max(0, outerWidth - size) / 2;
  const heightOffset = Math.max(0, outerHeight - size) / 2;
  const rowHeight = size / rowCount;
  const columnWidth = size / columnCount;
  const cellCount = rowCount * columnCount;
  const valuePerCell = totalValue / cellCount;
  let valueSoFar = 0;
  let lastIndex = 0;

  return [
    { node: root, x0: 0, y0: 0, x1: size, y1: size },
    ...root[1][CHILDREN_KEY].flatMap((entry) => {
      const [, { value }] = entry;
      valueSoFar += value;
      const toIndex = Math.round(valueSoFar / valuePerCell);
      const cells = [];
      for (let i = lastIndex; i < toIndex; i++) {
        const columnIndex = i % columnCount;
        const rowIndex = (i - columnIndex) / columnCount;
        const x0 = outerX0 + widthOffset + columnIndex * columnWidth;
        const y0 = outerY0 + heightOffset + rowIndex * rowHeight;
        cells.push({
          node: entry,
          x0,
          y0,
          x1: x0 + columnWidth,
          y1: y0 + rowHeight,
        });
      }
      lastIndex = toIndex;
      return cells;
    }),
  ];
}
