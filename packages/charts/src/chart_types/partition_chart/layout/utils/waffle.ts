/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Part } from '../../../../common/text_utils';
import { CHILDREN_KEY, HierarchyOfArrays } from './group_by_rollup';

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
  const size = Math.min(outerWidth, outerHeight);
  const widthOffset = Math.max(0, outerWidth - size) / 2;
  const heightOffset = Math.max(0, outerHeight - size) / 2;
  const rowHeight = size / rowCount;
  const columnWidth = size / columnCount;
  const cellCount = rowCount * columnCount;
  const valuePerCell = totalValue / cellCount;
  let valueSoFar = 0;
  let lastIndex = 0;
  const root = tree[0];
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
