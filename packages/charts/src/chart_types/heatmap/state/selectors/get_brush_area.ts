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
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { clamp } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getBrushedHighlightedShapesSelector } from './get_brushed_highlighted_shapes';
import { getGridHeightParamsSelector } from './get_grid_full_height';

const getMouseDownPosition = (state: GlobalChartState) => state.interactions.pointer.down;
const getIsDragging = (state: GlobalChartState) => state.interactions.pointer.dragging;
const getCurrentPointerPosition = (state: GlobalChartState) => state.interactions.pointer.current.position;

/** @internal */
export const getBrushAreaSelector = createCustomCachedSelector(
  [
    getIsDragging,
    getMouseDownPosition,
    getCurrentPointerPosition,
    getSettingsSpecSelector,
    computeChartDimensionsSelector,
    getBrushedHighlightedShapesSelector,
    getGridHeightParamsSelector,
  ],
  (isDragging, mouseDownPosition, end, { brushAxis }, chartDimensions, dragShape, gridParams): Dimensions | null => {
    if (!isDragging || !mouseDownPosition || !dragShape) {
      return null;
    }
    const start = {
      x: mouseDownPosition.position.x - chartDimensions.left,
      y: mouseDownPosition.position.y,
    };

    const clampedEndY = clamp(end.y, 0, gridParams.gridCellHeight * gridParams.pageSize);

    switch (brushAxis) {
      case BrushAxis.Both:
        return {
          top: start.y,
          left: start.x,
          width: end.x - start.x - chartDimensions.left,
          height: clampedEndY - start.y,
        };
      default:
        return {
          top: start.y,
          left: start.x,
          width: end.x - start.x - chartDimensions.left,
          height: clampedEndY - start.y,
        };
    }
  },
);
