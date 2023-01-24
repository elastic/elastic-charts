/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SmallMultipleScales } from '../../../../common/panel_utils';
import { Rect } from '../../../../geoms/types';
import { SettingsSpec, PointerEvent } from '../../../../specs/settings';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeSmallMultipleScalesSelector } from '../../../../state/selectors/compute_small_multiple_scales';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { isNil } from '../../../../utils/common';
import { isValidPointerOverEvent } from '../../../../utils/events';
import { getCursorBandPosition } from '../../crosshair/crosshair_utils';
import { ChartDimensions } from '../../utils/dimensions';
import { BasicSeriesSpec } from '../../utils/specs';
import { isLineAreaOnlyChart } from '../utils/common';
import { ComputedGeometries } from '../utils/types';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
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
  getCursorBand,
);

function getCursorBand(
  orientedProjectedPointerPosition: PointerPosition,
  externalPointerEvent: PointerEvent | null,
  { chartDimensions }: ChartDimensions,
  settingsSpec: SettingsSpec,
  { scales: { xScale } }: Pick<ComputedGeometries, 'scales'>,
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
    if (isNil(externalPointerEvent.x)) {
      return;
    }
    const x = xScale.pureScale(externalPointerEvent.x);
    if (Number.isNaN(x) || x > chartDimensions.width || x < 0) {
      return;
    }
    pointerPosition = {
      x,
      y: 0,
      verticalPanelValue: null,
      horizontalPanelValue: null,
    };
    xValue = externalPointerEvent.x;
  } else {
    xValue = xScale.invertWithStep(orientedProjectedPointerPosition.x, geometriesIndexKeys as number[]).value; // TODO fix this cast
    if (isNil(xValue) || Number.isNaN(xValue)) {
      return;
    }
  }
  const { horizontal, vertical } = smallMultipleScales;
  const topPos =
    (!isNil(pointerPosition.verticalPanelValue) && vertical.scale(pointerPosition.verticalPanelValue)) || 0;
  const leftPos =
    (!isNil(pointerPosition.horizontalPanelValue) && horizontal.scale(pointerPosition.horizontalPanelValue)) || 0;

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
      value: xValue,
      withinBandwidth: true,
    },
    isTooltipSnapEnabled,
    xScale,
    isLineAreaOnly ? 0 : totalBarsInCluster,
  );
  return cursorBand && { ...cursorBand, fromExternalEvent };
}
