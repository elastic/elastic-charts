/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BrushAxis } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getActivePointerPosition } from '../../../../state/selectors/get_active_pointer_position';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { clamp } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { computeChartElementSizesSelector } from './compute_chart_dimensions';
import { getBrushedHighlightedShapesSelector } from './get_brushed_highlighted_shapes';

const getMouseDownPosition = (state: GlobalChartState) => state.interactions.pointer.down;
const getIsDragging = (state: GlobalChartState) => state.interactions.pointer.dragging;

/** @internal */
export const getBrushAreaSelector = createCustomCachedSelector(
  [
    getIsDragging,
    getMouseDownPosition,
    getActivePointerPosition,
    getSettingsSpecSelector,
    computeChartElementSizesSelector,
    getBrushedHighlightedShapesSelector,
  ],
  (isDragging, mouseDownPosition, end, { brushAxis }, dims, dragShape): Dimensions | null => {
    if (!isDragging || !mouseDownPosition || !dragShape) {
      return null;
    }

    const start = {
      x: mouseDownPosition.position.x - dims.grid.left,
      y: mouseDownPosition.position.y,
    };

    const clampedEndY = clamp(end.y, 0, dims.grid.height);
    switch (brushAxis) {
      case BrushAxis.Both:
        return {
          top: start.y,
          left: start.x,
          width: end.x - start.x - dims.grid.left,
          height: clampedEndY - start.y,
        };
      default:
        return {
          top: start.y,
          left: start.x,
          width: end.x - start.x - dims.grid.left,
          height: clampedEndY - start.y,
        };
    }
  },
);
