/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Rect } from '../../../../geoms/types';
import { isPointerOverEvent, PointerEvent } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getActivePointerPosition } from '../../../../state/selectors/get_active_pointer_position';
import { isNil } from '../../../../utils/common';
import { Point } from '../../../../utils/point';
import { Cell, ShapeViewModel, TextBox } from '../../layout/types/viewmodel_types';
import { getHeatmapGeometries } from './geometries';
import { getPickedShapes, hasPickedShapes } from './picked_shapes';

const getExternalPointerEventStateSelector = (state: GlobalChartState) => state.externalEvents.pointer;

/** @internal */
export const getCursorBandPositionSelector = createCustomCachedSelector(
  [getHeatmapGeometries, getExternalPointerEventStateSelector, getActivePointerPosition, getPickedShapes],
  getCursorBand,
);

function getCursorBand(
  geoms: ShapeViewModel,
  externalPointerEvent: PointerEvent | null,
  currentPointerPosition: Point,
  pickedShapes: Cell[] | TextBox,
): (Rect & { fromExternalEvent: boolean }) | undefined {
  // external pointer events takes precedence over the current mouse pointer
  if (isPointerOverEvent(externalPointerEvent)) {
    const { x } = externalPointerEvent;
    if (!isNil(x)) {
      const band = geoms.pickCursorBand(x);
      if (band) {
        return {
          ...band,
          fromExternalEvent: true,
        };
      }
    }
  }

  if (hasPickedShapes(pickedShapes)) {
    const point = currentPointerPosition;
    const end = { x: point.x + Number.EPSILON, y: point.y + Number.EPSILON };
    const band = geoms.pickDragShape([point, end]);
    if (band) {
      return {
        ...band,
        fromExternalEvent: false,
      };
    }
  }
}
