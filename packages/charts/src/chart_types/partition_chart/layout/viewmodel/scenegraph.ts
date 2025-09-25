/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { shapeViewModel } from './viewmodel';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import type { Dimensions } from '../../../../utils/dimensions';
import type { PartitionStyle } from '../../../../utils/themes/partition';
import type { BackgroundStyle } from '../../../../utils/themes/theme';
import type { Layer, PartitionSpec } from '../../specs';
import { VALUE_GETTERS } from '../config';
import type {
  PartitionSmallMultiplesModel,
  RawTextGetter,
  ShapeTreeNode,
  ShapeViewModel,
  ValueGetter,
} from '../types/viewmodel_types';
import type { HierarchyOfArrays } from '../utils/group_by_rollup';
import { DEPTH_KEY } from '../utils/group_by_rollup';

function rawTextGetter(layers: Layer[]): RawTextGetter {
  return (node: ShapeTreeNode) => {
    const accessorFn = layers[node[DEPTH_KEY] - 1]?.nodeLabel || ((d) => d);
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
  backgroundStyle: BackgroundStyle,
  style: PartitionStyle,
  panelModel: PartitionSmallMultiplesModel,
): ShapeViewModel {
  return withTextMeasure((measureText) => {
    return shapeViewModel(
      measureText,
      spec,
      style,
      parentDimensions,
      rawTextGetter(spec.layers),
      valueGetterFunction(spec.valueGetter),
      tree,
      backgroundStyle,
      panelModel,
    );
  });
}
