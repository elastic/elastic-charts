/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getBrushedHighlightedShapesSelector } from './get_brushed_highlighted_shapes';
import { BrushAxis } from '../../../../specs/brush_axis';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { GlobalChartState } from '../../../../state/global_chart_state';
import { getActivePointerPosition } from '../../../../state/selectors/get_active_pointer_position';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { isBrushingSelector } from '../../../../state/selectors/is_brushing';
import { clamp } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';

const getMouseDownPosition = (state: GlobalChartState) => state.interactions.pointer.down;

/** @internal */
export const getBrushAreaSelector = createCustomCachedSelector(
  [
    isBrushingSelector,
    getMouseDownPosition,
    getActivePointerPosition,
    getSettingsSpecSelector,
    computeChartDimensionsSelector,
    getBrushedHighlightedShapesSelector,
  ],
  (isBrushing, mouseDownPosition, end, { brushAxis }, { chartDimensions }, dragShape): Dimensions | null => {
    if (!isBrushing || !mouseDownPosition || !dragShape) {
      return null;
    }

    const start = {
      x: mouseDownPosition.position.x - chartDimensions.left,
      y: mouseDownPosition.position.y - chartDimensions.top,
    };

    const clampedEndY = clamp(end.y, 0, chartDimensions.height);
    switch (brushAxis) {
      case BrushAxis.Both:
        return {
          top: start.y,
          left: start.x,
          width: end.x - start.x - chartDimensions.left,
          height: clampedEndY - start.y - chartDimensions.top,
        };
      default:
        return {
          top: start.y,
          left: start.x,
          width: end.x - start.x - chartDimensions.left,
          height: clampedEndY - start.y - chartDimensions.top,
        };
    }
  },
);
