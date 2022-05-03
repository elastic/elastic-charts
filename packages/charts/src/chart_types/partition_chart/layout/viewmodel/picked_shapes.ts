/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LayerValue } from '../../../../specs';
import { Point } from '../../../../utils/point';
import { ContinuousDomainFocus } from '../../renderer/canvas/partition';
import { MODEL_KEY } from '../config';
import { QuadViewModel, ShapeViewModel } from '../types/viewmodel_types';
import { AGGREGATE_KEY, DEPTH_KEY, getNodeName, PARENT_KEY, PATH_KEY, SORT_INDEX_KEY } from '../utils/group_by_rollup';

/** @internal */
export const pickedShapes = (
  models: ShapeViewModel[],
  { x, y }: Point,
  foci: ContinuousDomainFocus[],
): QuadViewModel[] =>
  models.flatMap(({ diskCenter, pickQuads }) => pickQuads(x - diskCenter.x, y - diskCenter.y, foci[0]));

/** @internal */
export function pickShapesLayerValues(shapes: QuadViewModel[]): LayerValue[][] {
  const maxDepth = shapes.reduce((acc, curr) => Math.max(acc, curr.depth), 0);
  return shapes
    .filter(({ depth }) => depth === maxDepth) // eg. lowest layer in a treemap, where layers overlap in screen space; doesn't apply to sunburst/flame
    .map<LayerValue[]>((viewModel) => {
      const values: LayerValue[] = [
        {
          smAccessorValue: viewModel.smAccessorValue,
          groupByRollup: viewModel.dataName,
          value: viewModel[AGGREGATE_KEY],
          depth: viewModel[DEPTH_KEY],
          sortIndex: viewModel[SORT_INDEX_KEY],
          path: viewModel[PATH_KEY],
          vmIndex: viewModel.vmIndex,
        },
      ];
      let node = viewModel[MODEL_KEY];
      while (node[DEPTH_KEY] > 0) {
        const value = node[AGGREGATE_KEY];
        const dataName = getNodeName(node);
        values.push({
          smAccessorValue: viewModel.smAccessorValue,
          groupByRollup: dataName,
          value,
          depth: node[DEPTH_KEY],
          sortIndex: node[SORT_INDEX_KEY],
          path: node[PATH_KEY],
          vmIndex: NaN, // currently we only care about the `vmIndex` of the picked leaf node, not those of its ancestors
        });

        node = node[PARENT_KEY];
      }
      return values.reverse();
    });
}
