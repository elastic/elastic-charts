/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isLinear } from './viewmodel';
import { TooltipInfo } from '../../../../components/tooltip';
import { LayerValue } from '../../../../specs/settings';
import { TooltipValue } from '../../../../specs/tooltip';
import { LabelAccessor, ValueFormatter } from '../../../../utils/common';
import { SpecId } from '../../../../utils/ids';
import { Point } from '../../../../utils/point';
import { ContinuousDomainFocus } from '../../renderer/canvas/partition';
import { MODEL_KEY, percentValueGetter } from '../config';
import { QuadViewModel, ShapeViewModel } from '../types/viewmodel_types';
import {
  AGGREGATE_KEY,
  ArrayNode,
  CHILDREN_KEY,
  DEPTH_KEY,
  entryValue,
  getNodeName,
  PARENT_KEY,
  PATH_KEY,
  SORT_INDEX_KEY,
} from '../utils/group_by_rollup';

/** @internal */
export const pickedShapes = (
  models: ShapeViewModel[],
  { x, y }: Point,
  [focus]: ContinuousDomainFocus[],
): QuadViewModel[] =>
  focus ? models.flatMap(({ diskCenter, pickQuads }) => pickQuads(x - diskCenter.x, y - diskCenter.y, focus)) : [];

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
        });

        node = node[PARENT_KEY];
      }
      return values.reverse();
    });
}

/** @internal */
export function pickShapesTooltipValues(
  shapes: QuadViewModel[],
  shapeViewModel: ShapeViewModel[],
  valueFormatter: ValueFormatter,
  percentFormatter: ValueFormatter,
  id: SpecId,
): TooltipInfo {
  const maxDepth = shapes.reduce((acc, curr) => Math.max(acc, curr.depth), 0);
  const currentShapeViewModel = shapeViewModel.find((d) => d.smAccessorValue === shapes[0]?.smAccessorValue);
  if (!currentShapeViewModel) {
    return { values: [], header: null };
  }
  const labelFormatters = currentShapeViewModel.layers.map((d) => d.nodeLabel);

  return {
    header: null,
    values: shapes
      .filter(({ depth }) => depth === maxDepth) // eg. lowest layer in a treemap, where layers overlap in screen space; doesn't apply to sunburst/flame
      .flatMap<TooltipValue>((viewModel) => {
        const entryNode = viewModel[PARENT_KEY][CHILDREN_KEY][viewModel[SORT_INDEX_KEY]];
        if (!entryNode) return [];
        const values: TooltipValue[] = [
          getTooltipValueFromNode(
            entryValue(entryNode),
            labelFormatters,
            valueFormatter,
            percentFormatter,
            currentShapeViewModel,
            id,
          ),
        ];
        // return only the leaf node if flame/icicle to avoid its highly hierarchical nature
        if (isLinear(currentShapeViewModel.layout)) {
          return values;
        }
        let node = viewModel[MODEL_KEY];
        while (node[DEPTH_KEY] > 0) {
          values.push(
            getTooltipValueFromNode(node, labelFormatters, valueFormatter, percentFormatter, currentShapeViewModel, id),
          );
          node = node[PARENT_KEY];
        }
        return values.reverse();
      }),
  };
}

function getTooltipValueFromNode(
  node: ArrayNode,
  labelFormatters: (LabelAccessor | undefined)[],
  valueFormatter: ValueFormatter,
  percentFormatter: ValueFormatter,
  shapeViewModel: ShapeViewModel,
  id: SpecId,
): TooltipValue {
  const depth = node[DEPTH_KEY];
  const value = node[AGGREGATE_KEY];
  const dataName = getNodeName(node);
  const formatter = labelFormatters[depth - 1];
  const model = shapeViewModel.quadViewModel.find(
    (d) => d.depth === depth && d.dataName === dataName && d.value === value,
  );
  return {
    label: formatter ? formatter(dataName) : dataName,
    color: model?.fillColor ?? 'transparent',
    isHighlighted: false,
    isVisible: true,
    seriesIdentifier: {
      specId: id,
      key: model?.dataName ?? '',
    },
    value: node[AGGREGATE_KEY],
    formattedValue: `${valueFormatter(value)}\u00A0(${percentFormatter(percentValueGetter(node))})`,
    valueAccessor: node[DEPTH_KEY],
  };
}
