/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getPickedShapes } from './picked_shapes';
import { AnchorPosition } from '../../../../components/portal/types';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeSmallMultipleScalesSelector } from '../../../../state/selectors/compute_small_multiple_scales';
import { getActivePointerPosition } from '../../../../state/selectors/get_active_pointer_position';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';

/** @internal */
export const getTooltipAnchorSelector = createCustomCachedSelector(
  [
    getPickedShapes,
    computeChartDimensionsSelector,
    getActivePointerPosition,
    computeSmallMultipleScalesSelector,
    getChartThemeSelector,
  ],
  (shapes, { chartDimensions }, position, smScales, { heatmap }): AnchorPosition => {
    const shape = Array.isArray(shapes) && shapes[0];
    if (shape) {
      const {
        x,
        y,
        width,
        height,
        datum: { smHorizontalAccessorValue = '', smVerticalAccessorValue = '' },
      } = shape;

      const scaledPanelXOffset = smScales.horizontal.scale(smHorizontalAccessorValue);
      const scaledPanelYOffset = smScales.vertical.scale(smVerticalAccessorValue);

      const panelXOffset = isNaN(scaledPanelXOffset) ? 0 : scaledPanelXOffset;
      const panelYOffset = isNaN(scaledPanelYOffset) ? 0 : scaledPanelYOffset;

      return {
        x: x + chartDimensions.left + panelXOffset,
        width,
        y: y - chartDimensions.top + panelYOffset + heatmap.grid.stroke.width,
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
