/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPerPanelHeatmapGeometries } from './get_per_panel_heatmap_geometries';
import { getPickedGridCell } from './picked_shapes';
import type { Rect } from '../../../../geoms/types';
import { isPointerOverEvent } from '../../../../specs';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getInternalIsBrushingSelector } from '../../../../state/selectors/get_internal_is_brushing';
import { isNil } from '../../../../utils/common';

const getExternalPointerEventStateSelector = (state: GlobalChartState) => state.externalEvents.pointer;

/** @internal */
export const getCursorBandPositionSelector = createCustomCachedSelector(
  [
    getPerPanelHeatmapGeometries,
    getExternalPointerEventStateSelector,
    getPickedGridCell,
    getInternalIsBrushingSelector,
  ],
  (geoms, externalPointerEvent, pickedGridCell, isBrushing): (Rect & { fromExternalEvent: boolean }) | undefined => {
    // block cursor when brushing
    if (isBrushing) return;

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

    if (pickedGridCell) {
      const band = geoms.pickCursorBand(pickedGridCell.x);
      if (band) {
        return {
          ...band,
          fromExternalEvent: false,
        };
      }
    }
  },
);
