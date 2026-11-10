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
import type { CursorBandTarget } from '../../layout/types/viewmodel_types';

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

    const bandFrom = (cell: CursorBandTarget, fromExternalEvent: boolean) => {
      const band = geoms.pickCursorBand(cell);
      return band && { ...band, fromExternalEvent };
    };

    // external pointer events takes precedence over the current mouse pointer
    if (isPointerOverEvent(externalPointerEvent)) {
      const { x, smHorizontalValue, smVerticalValue } = externalPointerEvent;
      if (isNil(x)) return;
      return bandFrom(
        {
          x,
          smHorizontalAccessorValue: smHorizontalValue,
          smVerticalAccessorValue: smVerticalValue,
        },
        true,
      );
    }

    return pickedGridCell ? bandFrom(pickedGridCell, false) : undefined;
  },
);
