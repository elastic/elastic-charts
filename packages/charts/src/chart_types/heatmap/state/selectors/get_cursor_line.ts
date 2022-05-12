// @ts-nocheck
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getOrientedProjectedPointerPositionSelector } from '../../../xy_chart/state/selectors/get_oriented_projected_pointer_position';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getSeriesSpecsSelector } from '../../../xy_chart/state/selectors/get_specs';
import { countBarsInClusterSelector } from '../../../xy_chart/state/selectors/count_bars_in_cluster';
import { isTooltipSnapEnableSelector } from '../../../xy_chart/state/selectors/is_tooltip_snap_enabled';
import { getGeometriesIndexKeysSelector } from '../../../xy_chart/state/selectors/get_geometries_index_keys';
import {
  computeSmallMultipleScalesSelector,
  SmallMultipleScales,
} from '../../../xy_chart/state/selectors/compute_small_multiple_scales';
import { PointerPosition } from '../../../xy_chart/state/selectors/get_projected_pointer_position';
import { BasicSeriesSpec, PointerEvent, SettingsSpec } from '../../../../specs';
import { Rect } from '../../../../geoms/types';
import { isLineAreaOnlyChart } from '../../../xy_chart/state/utils/common';
import { isValidPointerOverEvent } from '../../../../utils/events';
import { getCursorBandPosition } from '../../../xy_chart/crosshair/crosshair_utils';
import { ChartElementSizes, computeChartElementSizesSelector } from './compute_chart_dimensions';
import { getHeatmapGeometries } from './geometries';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';

const getExternalPointerEventStateSelector = (state: GlobalChartState) => state.externalEvents.pointer;

/** @internal */
export const getCursorLinePositionSelector = createCustomCachedSelector(
  [getHeatmapGeometries,
    getOrientedProjectedPointerPositionSelector,
    getExternalPointerEventStateSelector,
    // computeChartDimensionsSelector,
    computeChartElementSizesSelector,
    getSettingsSpecSelector,
    // computeSeriesGeometriesSelector,
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
  // { scales: { xScale } }: Pick<ComputedGeometries, 'scales'>,
  seriesSpecs: BasicSeriesSpec[],
  totalBarsInCluster: number,
  isTooltipSnapEnabled: boolean,
  geometriesIndexKeys: (string | number)[],
  smallMultipleScales: SmallMultipleScales,
): (Rect & { fromExternalEvent: boolean }) | undefined {

  const chartDimensions = heatmapChartElementSizes.grid;
  const xScale = geoms.xScale
  // const xScale = geoms.pickInvertedPosition,
  // console.log("chartDimensions ", chartDimensions)

  console.log("xScale", xScale)
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
  return cursorBand && { ...cursorBand, fromExternalEvent };
}
