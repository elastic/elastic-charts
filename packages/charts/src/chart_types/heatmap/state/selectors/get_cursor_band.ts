/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPerPanelHeatmapGeometries } from './get_per_panel_heatmap_geometries';
import { getTooltipAnchorSelector } from './get_tooltip_anchor';
import { getPickedShapes, hasPicketVisibleCells } from './picked_shapes';
import { Rect } from '../../../../geoms/types';
import { isPointerOverEvent } from '../../../../specs/settings';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getInternalIsBrushingSelector } from '../../../../state/selectors/get_internal_is_brushing';
import { isNil } from '../../../../utils/common';

const getExternalPointerEventStateSelector = (state: GlobalChartState) => state.externalEvents.pointer;

/** @internal */
export const getCursorBandPositionSelector = createCustomCachedSelector(
  [
    getPerPanelHeatmapGeometries,
    getExternalPointerEventStateSelector,
    getPickedShapes,
    getTooltipAnchorSelector,
    getInternalIsBrushingSelector,
  ],
  (
    geoms,
    externalPointerEvent,
    pickedShapes,
    tooltipShape,
    isBrushing,
  ): (Rect & { fromExternalEvent: boolean }) | undefined => {
    // block cursor when brusing
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

    if (hasPicketVisibleCells(pickedShapes)) {
      return {
        ...tooltipShape,
        fromExternalEvent: false,
      };
    }
  },
);
