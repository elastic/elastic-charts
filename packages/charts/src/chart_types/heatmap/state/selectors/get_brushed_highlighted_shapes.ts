/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getActivePointerPosition } from './../../../../state/selectors/get_active_pointer_position';
import { getHeatmapGeometries } from './geometries';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { DragShape } from '../../layout/types/viewmodel_types';

function getCurrentPointerStates(state: GlobalChartState) {
  return state.interactions.pointer;
}

/** @internal */
export const getBrushedHighlightedShapesSelector = createCustomCachedSelector(
  [getHeatmapGeometries, getCurrentPointerStates, getActivePointerPosition],
  (geoms, pointerStates, activePosition): DragShape => {
    if (!pointerStates.dragging || !pointerStates.down) {
      return null;
    }

    return geoms.pickDragShape([pointerStates.down.position, activePosition]);
  },
);
