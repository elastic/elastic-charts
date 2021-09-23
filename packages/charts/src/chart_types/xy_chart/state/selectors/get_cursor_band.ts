/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Rect } from '../../../../geoms/types';
import { Scale } from '../../../../scales';
import { SettingsSpec, PointerEvent } from '../../../../specs/settings';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { Dimensions } from '../../../../utils/dimensions';
import { isValidPointerOverEvent } from '../../../../utils/events';
import { getCursorBandPosition } from '../../crosshair/crosshair_utils';
import { BasicSeriesSpec } from '../../utils/specs';
import { isLineAreaOnlyChart } from '../utils/common';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { computeSmallMultipleScalesSelector, SmallMultipleScales } from './compute_small_multiple_scales';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import { getGeometriesIndexKeysSelector } from './get_geometries_index_keys';
import { getOrientedProjectedPointerPositionSelector } from './get_oriented_projected_pointer_position';
import { PointerPosition } from './get_projected_pointer_position';
import { getSeriesSpecsSelector } from './get_specs';
import { isTooltipSnapEnableSelector } from './is_tooltip_snap_enabled';

const getExternalPointerEventStateSelector = (state: GlobalChartState) => state.externalEvents.pointer;

/** @internal */
export const getCursorBandPositionSelector = createCustomCachedSelector(
  [
    getOrientedProjectedPointerPositionSelector,
    getExternalPointerEventStateSelector,
    computeChartDimensionsSelector,
    getSettingsSpecSelector,
    computeSeriesGeometriesSelector,
    getSeriesSpecsSelector,
    countBarsInClusterSelector,
    isTooltipSnapEnableSelector,
    getGeometriesIndexKeysSelector,
    computeSmallMultipleScalesSelector,
  ],
  (
    orientedProjectedPointerPosition,
    externalPointerEvent,
    chartDimensions,
    settingsSpec,
    seriesGeometries,
    seriesSpec,
    totalBarsInCluster,
    isTooltipSnapEnabled,
    geometriesIndexKeys,
    smallMultipleScales,
  ) =>
    getCursorBand(
      orientedProjectedPointerPosition,
      externalPointerEvent,
      chartDimensions.chartDimensions,
      settingsSpec,
      seriesGeometries.scales.xScale,
      seriesSpec,
      totalBarsInCluster,
      isTooltipSnapEnabled,
      geometriesIndexKeys,
      smallMultipleScales,
    ),
);

function getCursorBand(
  orientedProjectedPointerPosition: PointerPosition,
  externalPointerEvent: PointerEvent | null,
  chartDimensions: Dimensions,
  settingsSpec: SettingsSpec,
  xScale: Scale<number | string> | undefined,
  seriesSpecs: BasicSeriesSpec[],
  totalBarsInCluster: number,
  isTooltipSnapEnabled: boolean,
  geometriesIndexKeys: (string | number)[],
  smallMultipleScales: SmallMultipleScales,
): (Rect & { fromExternalEvent: boolean }) | undefined {
  if (!xScale) {
    return;
  }
  // update che cursorBandPosition based on chart configuration
  const isLineAreaOnly = isLineAreaOnlyChart(seriesSpecs);

  let pointerPosition = { ...orientedProjectedPointerPosition };

  let xValue;
  let fromExternalEvent = false;
  // external pointer events takes precedence over the current mouse pointer
  if (isValidPointerOverEvent(xScale, externalPointerEvent)) {
    fromExternalEvent = true;
    const x = xScale.pureScale(externalPointerEvent.x);
    if (x === null || x > chartDimensions.width || x < 0) {
      return;
    }
    pointerPosition = {
      x,
      y: 0,
      verticalPanelValue: null,
      horizontalPanelValue: null,
    };
    xValue = {
      value: externalPointerEvent.x,
      withinBandwidth: true,
    };
  } else {
    xValue = xScale.invertWithStep(orientedProjectedPointerPosition.x, geometriesIndexKeys);
    if (!xValue) {
      return;
    }
  }
  const { horizontal, vertical } = smallMultipleScales;
  const topPos = vertical.scale(pointerPosition.verticalPanelValue) || 0;
  const leftPos = horizontal.scale(pointerPosition.horizontalPanelValue) || 0;

  const panel = {
    width: horizontal.bandwidth,
    height: vertical.bandwidth,
    top: chartDimensions.top + topPos,
    left: chartDimensions.left + leftPos,
  };
  const cursorBand = getCursorBandPosition(
    settingsSpec.rotation,
    panel,
    pointerPosition,
    {
      value: xValue.value,
      withinBandwidth: true,
    },
    isTooltipSnapEnabled,
    xScale,
    isLineAreaOnly ? 0 : totalBarsInCluster,
  );
  return (
    cursorBand && {
      ...cursorBand,
      fromExternalEvent,
    }
  );
}
