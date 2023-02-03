/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AnchorPosition } from '../../../../components/portal/types';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeSmallMultipleScalesSelector } from '../../../../state/selectors/compute_small_multiple_scales';
import { getActivePointerPosition } from '../../../../state/selectors/get_active_pointer_position';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getPickedShapes } from './picked_shapes';

/** @internal */
export const getTooltipAnchorSelector = createCustomCachedSelector(
  [getPickedShapes, computeChartDimensionsSelector, getActivePointerPosition, computeSmallMultipleScalesSelector],
  (shapes, { chartDimensions }, position, smScales): AnchorPosition => {
    if (Array.isArray(shapes) && shapes.length > 0) {
      const [{ x, y, width, height, h, v }] = shapes;
      const panelXOffset = smScales.horizontal.scale(h ?? '') ?? 0;
      const panelYOffset = smScales.vertical.scale(v ?? '') ?? 0;
      return {
        x: x + chartDimensions.left + panelXOffset,
        width,
        y: y - chartDimensions.top + panelYOffset,
        height,
      };
    }
    return {
      x: position.x,
      width: 0,
      y: position.y,
      height: 0,
    };
  },
);
