/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AnchorPosition } from '../../../../components/portal/types';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getActivePointerPosition } from '../../../../state/selectors/get_active_pointer_position';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getPickedShapes } from './picked_shapes';

/** @internal */
export const getTooltipAnchorSelector = createCustomCachedSelector(
  [getPickedShapes, computeChartDimensionsSelector, getActivePointerPosition],
  (shapes, { chartDimensions }, position): AnchorPosition => {
    if (Array.isArray(shapes) && shapes.length > 0) {
      const firstShape = shapes[0];
      return {
        x: firstShape.x + chartDimensions.left,
        width: firstShape.width,
        y: firstShape.y - chartDimensions.top,
        height: firstShape.height,
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
