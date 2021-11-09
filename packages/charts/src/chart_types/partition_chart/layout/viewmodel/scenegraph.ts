/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../../../../common/colors';
import { measureText } from '../../../../common/text_utils';
import { Dimensions } from '../../../../utils/dimensions';
import { PartitionStyle } from '../../../../utils/themes/partition';
import { Layer, PartitionSpec } from '../../specs';
import { VALUE_GETTERS } from '../config';
import {
  nullShapeViewModel,
  PartitionSmallMultiplesModel,
  RawTextGetter,
  ShapeTreeNode,
  ShapeViewModel,
  ValueGetter,
} from '../types/viewmodel_types';
import { DEPTH_KEY, HierarchyOfArrays } from '../utils/group_by_rollup';
import { shapeViewModel } from './viewmodel';

function rawTextGetter(layers: Layer[]): RawTextGetter {
  return (node: ShapeTreeNode) => {
    const accessorFn = layers[node[DEPTH_KEY] - 1].nodeLabel || ((d) => d);
    return `${accessorFn(node.dataName)}`;
  };
}

/** @internal */
export function valueGetterFunction(valueGetter: ValueGetter) {
  return typeof valueGetter === 'function' ? valueGetter : VALUE_GETTERS[valueGetter];
}

/** @internal */
export function getShapeViewModel(
  spec: PartitionSpec,
  parentDimensions: Dimensions,
  tree: HierarchyOfArrays,
  containerBackgroundColor: Color,
  style: PartitionStyle,
  panelModel: PartitionSmallMultiplesModel,
): ShapeViewModel {
  const textMeasurer = document.createElement('canvas');
  const textMeasurerCtx = textMeasurer.getContext('2d');
  if (!textMeasurerCtx) {
    const { width, height } = parentDimensions;
    return nullShapeViewModel(spec.layout, style, { x: width / 2, y: height / 2 });
  }
  const valueGetter = valueGetterFunction(spec.valueGetter);

  return shapeViewModel(
    measureText(textMeasurerCtx),
    spec,
    style,
    parentDimensions,
    rawTextGetter(spec.layers),
    valueGetter,
    tree,
    containerBackgroundColor,
    panelModel,
  );
}
