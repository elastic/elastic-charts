/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Rect } from '../../../../geoms/types';
import { isPointerOverEvent, PointerEvent } from '../../../../specs';
import { GlobalChartState, PointerState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { isNil } from '../../../../utils/common';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { getHeatmapGeometries } from './geometries';

const getExternalPointerEventStateSelector = (state: GlobalChartState) => state.externalEvents.pointer;

const getPointerEventStateSelector = (state: GlobalChartState) => state.interactions.pointer.current;

/** @internal */
export const getCursorBandPositionSelector = createCustomCachedSelector(
  [getHeatmapGeometries, getExternalPointerEventStateSelector, getPointerEventStateSelector, getSettingsSpecSelector],
  getCursorBand,
);

function getCursorBand(
  geoms: ShapeViewModel,
  externalPointerEvent: PointerEvent | null,
  currentPointer: PointerState,
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
  // display the current hovered cell
  if (currentPointer.position.x > -1) {
    const point = currentPointer.position;
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
