/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartElementSizesSelector } from './compute_chart_dimensions';
import { getPickedShapes } from './picked_shapes';
import { AnchorPosition } from '../../../../components/portal/types';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getActivePointerPosition } from '../../../../state/selectors/get_active_pointer_position';

/** @internal */
export const getTooltipAnchorSelector = createCustomCachedSelector(
  [getPickedShapes, computeChartElementSizesSelector, getActivePointerPosition],
  (shapes, { grid }, position): AnchorPosition => {
    if (Array.isArray(shapes) && shapes.length > 0) {
      const firstShape = shapes[0];
      return {
        x: firstShape.x + grid.left,
        width: firstShape.width,
        y: firstShape.y - grid.top,
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
