/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AnchorPosition } from '../../../../components/portal/types';
import { isTooltipType } from '../../../../specs/settings';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { isNil } from '../../../../utils/common';
import { getTooltipAnchorPosition } from '../../crosshair/crosshair_utils';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSmallMultipleScalesSelector } from './compute_small_multiple_scales';
import { getCursorBandPositionSelector } from './get_cursor_band';
import { getProjectedPointerPositionSelector } from './get_projected_pointer_position';

/** @internal */
export const getTooltipAnchorPositionSelector = createCustomCachedSelector(
  [
    computeChartDimensionsSelector,
    getSettingsSpecSelector,
    getCursorBandPositionSelector,
    getProjectedPointerPositionSelector,
    computeSmallMultipleScalesSelector,
  ],
  (
    chartDimensions,
    settings,
    cursorBandPosition,
    projectedPointerPosition,
    { horizontal, vertical },
  ): AnchorPosition | null => {
    if (!cursorBandPosition) {
      return null;
    }

    const topPos =
      (!isNil(projectedPointerPosition.verticalPanelValue) &&
        vertical.scale(projectedPointerPosition.verticalPanelValue)) ||
      0;
    const leftPos =
      (!isNil(projectedPointerPosition.horizontalPanelValue) &&
        horizontal.scale(projectedPointerPosition.horizontalPanelValue)) ||
      0;

    const panel = {
      width: horizontal.bandwidth,
      height: vertical.bandwidth,
      top: chartDimensions.chartDimensions.top + topPos,
      left: chartDimensions.chartDimensions.left + leftPos,
    };

    return getTooltipAnchorPosition(
      settings.rotation,
      cursorBandPosition,
      projectedPointerPosition,
      panel,
      isTooltipType(settings.tooltip) ? undefined : settings.tooltip.stickTo,
    );
  },
);
