/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DEFAULT_CSS_CURSOR } from '../../../../common/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getProjectedScaledValues } from './get_projected_scaled_values';
import { getHighlightedGeomsSelector } from './get_tooltip_values_highlighted_geoms';
import { isBrushAvailableSelector } from './is_brush_available';

const getCurrentPointerPositionSelector = (state: GlobalChartState) => state.interactions.pointer.current.position;

/** @internal */
export const getPointerCursorSelector = createCustomCachedSelector(
  [
    getHighlightedGeomsSelector,
    getSettingsSpecSelector,
    getCurrentPointerPositionSelector,
    getProjectedScaledValues,
    computeChartDimensionsSelector,
    isBrushAvailableSelector,
  ],
  (
    highlightedGeometries,
    settingsSpec,
    currentPointerPosition,
    projectedValues,
    { chartDimensions },
    isBrushAvailable,
  ): string => {
    const { x, y } = currentPointerPosition;
    // get positions relative to chart
    const xPos = x - chartDimensions.left;
    const yPos = y - chartDimensions.top;

    // limit cursorPosition to chartDimensions
    if (xPos < 0 || xPos >= chartDimensions.width || yPos < 0 || yPos >= chartDimensions.height) {
      return DEFAULT_CSS_CURSOR;
    }
    if (highlightedGeometries.length > 0 && (settingsSpec.onElementClick || settingsSpec.onElementOver)) {
      return 'pointer';
    }

    // no pointer if there is a onAnnotionClick but there is a highlighted geometry
    if (highlightedGeometries.length > 0 && (!settingsSpec.onElementClick || !settingsSpec.onElementOver)) {
      return DEFAULT_CSS_CURSOR;
    }
    if (settingsSpec.onAnnotationClick) {
      return 'pointer';
    }
    if (projectedValues !== null && settingsSpec.onProjectionClick) {
      return 'pointer';
    }
    return isBrushAvailable ? 'crosshair' : DEFAULT_CSS_CURSOR;
  },
);
