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
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { Dimensions } from '../../../../utils/dimensions';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';

const getMouseDownPosition = (state: GlobalChartState) => state.interactions.pointer.down;
const getIsDragging = (state: GlobalChartState) => state.interactions.pointer.dragging;
const getCurrentPointerPosition = (state: GlobalChartState) => state.interactions.pointer.current.position;

/** @internal */
export const getBrushAreaSelector = createCustomCachedSelector(
  [
    getIsDragging,
    getMouseDownPosition,
    getCurrentPointerPosition,
    getChartRotationSelector,
    getSettingsSpecSelector,
    computeChartDimensionsSelector,
  ],
  (isDragging, mouseDownPosition, end, chartRotation, { brushAxis }, chartDimensions): Dimensions | null => {
    if (!isDragging || !mouseDownPosition) {
      return null;
    }
    const start = {
      x: mouseDownPosition.position.x - chartDimensions.left,
      y: mouseDownPosition.position.y,
    };
    switch (brushAxis) {
      case BrushAxis.Both:
      default:
        return { top: start.y, left: start.x, width: end.x - start.x - chartDimensions.left, height: end.y - start.y };
    }
  },
);
