/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { sortedIndex } from 'lodash';

import { Rect } from '../../../../geoms/types';
import { BasicSeriesSpec, PointerEvent, SettingsSpec } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { isValidPointerOverEvent } from '../../../../utils/events';
import {
  computeSmallMultipleScalesSelector,
  SmallMultipleScales,
} from '../../../xy_chart/state/selectors/compute_small_multiple_scales';
import { countBarsInClusterSelector } from '../../../xy_chart/state/selectors/count_bars_in_cluster';
import { getGeometriesIndexKeysSelector } from '../../../xy_chart/state/selectors/get_geometries_index_keys';
import { getOrientedProjectedPointerPositionSelector } from '../../../xy_chart/state/selectors/get_oriented_projected_pointer_position';
import { PointerPosition } from '../../../xy_chart/state/selectors/get_projected_pointer_position';
import { getSeriesSpecsSelector } from '../../../xy_chart/state/selectors/get_specs';
import { isTooltipSnapEnableSelector } from '../../../xy_chart/state/selectors/is_tooltip_snap_enabled';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { getHeatmapCursorBandPosition } from '../../scales/band_position';
import { ChartElementSizes, computeChartElementSizesSelector } from './compute_chart_dimensions';
import { getHeatmapGeometries } from './geometries';

const getExternalPointerEventStateSelector = (state: GlobalChartState) => state.externalEvents.pointer;

/** @internal */
export const getCursorBandPositionSelector = createCustomCachedSelector(
  [
    getHeatmapGeometries,
    getOrientedProjectedPointerPositionSelector,
    getExternalPointerEventStateSelector,
    computeChartElementSizesSelector,
    getSettingsSpecSelector,
    getSeriesSpecsSelector,
    countBarsInClusterSelector,
    isTooltipSnapEnableSelector,
    getGeometriesIndexKeysSelector,
    computeSmallMultipleScalesSelector,
  ],
  getCursorBand,
);

function getCursorBand(
  geoms: ShapeViewModel,
  orientedProjectedPointerPosition: PointerPosition,
  externalPointerEvent: PointerEvent | null,
  heatmapChartElementSizes: ChartElementSizes,
  settingsSpec: SettingsSpec,
  seriesSpecs: BasicSeriesSpec[],
  totalBarsInCluster: number,
  isTooltipSnapEnabled: boolean,
  geometriesIndexKeys: (string | number)[],
  smallMultipleScales: SmallMultipleScales,
): (Rect & { fromExternalEvent: boolean }) | undefined {
  const chartDimensions = heatmapChartElementSizes.grid;
  const xScaleBand = geoms.xScaleBand;

  if (!xScaleBand) {
    return;
  }

  let pointerPosition = { ...orientedProjectedPointerPosition };

  let xValue;
  let fromExternalEvent = false;
  // external pointer events takes precedence over the current mouse pointer
  if (isValidPointerOverEvent(xScaleBand, externalPointerEvent) && externalPointerEvent.x !== null) {
    fromExternalEvent = true;
    let x = xScaleBand.pureScale(externalPointerEvent.x);

    // Converting from continuous x positions from xy charts
    // to the closest band
    let neartestXBand = externalPointerEvent.x;
    if (isNaN(x) && Array.isArray(xScaleBand.domain)) {
      neartestXBand = xScaleBand.domain[Math.max(sortedIndex(xScaleBand.domain, externalPointerEvent.x) - 1, 0)];
      x = xScaleBand.pureScale(neartestXBand);
    }
    if (Number.isNaN(x) || x > chartDimensions.width || x < 0) {
      return;
    }
    pointerPosition = {
      x,
      y: 0,
      verticalPanelValue: null,
      horizontalPanelValue: null,
    };
    xValue = {
      value: neartestXBand ?? externalPointerEvent.x,
      withinBandwidth: true,
    };
  } else {
    xValue = xScaleBand.invertWithStep(orientedProjectedPointerPosition.x);
    if (!xValue) {
      return;
    }
  }
  const { horizontal, vertical } = smallMultipleScales;
  const topPos =
    pointerPosition.verticalPanelValue !== null ? vertical.scale(pointerPosition.verticalPanelValue) || 0 : 0;
  const leftPos =
    pointerPosition.horizontalPanelValue !== null ? horizontal.scale(pointerPosition.horizontalPanelValue) || 0 : 0;

  const panel = {
    width: horizontal.bandwidth,
    height: chartDimensions.height,
    top: chartDimensions.top + topPos,
    left: chartDimensions.left + leftPos,
  };
  const cursorBand = getHeatmapCursorBandPosition(
    settingsSpec.rotation,
    panel,
    pointerPosition,
    {
      value: xValue.value,
      withinBandwidth: true,
    },
    isTooltipSnapEnabled,
    xScaleBand,
    totalBarsInCluster,
  );
  return cursorBand && { ...cursorBand, fromExternalEvent };
}
