/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getActivePointerPosition } from './../../../../state/selectors/get_active_pointer_position';
import { geometries, getPrimitiveGeoms } from './geometries';
import { Rectangle } from '../../../../common/geometry';
import { LayerValue } from '../../../../specs/settings';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { BulletViewModel } from '../../layout/types/viewmodel_types';
import { initialBoundingBox, Mark } from '../../layout/viewmodel/geoms';

function fullBoundingBox(ctx: CanvasRenderingContext2D | null, geoms: Mark[]) {
  const box = initialBoundingBox();
  if (ctx) {
    for (const g of geoms) {
      for (const { x0, y0, x1, y1 } of g.boundingBoxes(ctx)) {
        box.x0 = Math.min(box.x0, x0, x1);
        box.y0 = Math.min(box.y0, y0, y1);
        box.x1 = Math.max(box.x1, x0, x1);
        box.y1 = Math.max(box.y1, y0, y1);
      }
    }
  }
  return box;
}

/** @internal */
export const getCaptureBoundingBox = createCustomCachedSelector([getPrimitiveGeoms], (geoms): Rectangle => {
  const textMeasurer = document.createElement('canvas');
  const ctx = textMeasurer.getContext('2d');
  return fullBoundingBox(ctx, geoms);
});

/** @internal */
export const getPickedShapes = createCustomCachedSelector(
  [geometries, getActivePointerPosition, getCaptureBoundingBox],
  (geoms, pointerPosition, capture): BulletViewModel[] => {
    const picker = geoms.pickQuads;
    const { chartCenter } = geoms;
    const { x, y } = pointerPosition;
    return capture.x0 <= x && x <= capture.x1 && capture.y0 <= y && y <= capture.y1
      ? picker(x - chartCenter.x, y - chartCenter.y)
      : [];
  },
);

/** @internal */
export const getPickedShapesLayerValues = createCustomCachedSelector(
  [getPickedShapes],
  (pickedShapes): Array<Array<LayerValue>> => {
    return pickedShapes.map<Array<LayerValue>>((model) => {
      const values: Array<LayerValue> = [];
      values.push({
        smAccessorValue: '',
        groupByRollup: 'Actual',
        value: model.actual,
        sortIndex: 0,
        path: [],
        depth: 0,
      });
      return values.reverse();
    });
  },
);
