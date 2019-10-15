import { Dimensions } from '../../../../utils/dimensions';
import createCachedSelector from 're-reselect';
import { Point } from '../../../../utils/point';
import { Scale } from '../../../../utils/scales/scales';
import { isLineAreaOnlyChart } from '../utils';
import { getCursorBandPosition } from '../../crosshair/crosshair_utils';
import { SettingsSpec } from '../../../../specs/settings';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { BasicSeriesSpec } from '../../utils/specs';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import { getSeriesSpecsSelector } from './get_specs';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { getAxisCursorPositionSelector } from './get_axis_cursor_position';
import { isTooltipSnapEnableSelector } from './is_tooltip_snap_enabled';
import { getGeometriesIndexKeysSelector } from './get_geometries_index_keys';

export const getCursorBandPositionSelector = createCachedSelector(
  [
    getAxisCursorPositionSelector,
    computeChartDimensionsSelector,
    getSettingsSpecSelector,
    computeSeriesGeometriesSelector,
    getSeriesSpecsSelector,
    countBarsInClusterSelector,
    isTooltipSnapEnableSelector,
    getGeometriesIndexKeysSelector,
  ],
  (
    axisCursorPosition,
    chartDimensions,
    settingsSpec,
    seriesGeometries,
    seriesSpec,
    totalBarsInCluster,
    isTooltipSnapEnabled,
    geometriesIndexKeys,
  ) => {
    return getCursorBand(
      axisCursorPosition,
      chartDimensions.chartDimensions,
      settingsSpec,
      seriesGeometries.scales.xScale,
      seriesSpec,
      totalBarsInCluster,
      isTooltipSnapEnabled,
      geometriesIndexKeys,
    );
  },
)((state) => state.chartId);

function getCursorBand(
  axisCursorPosition: Point,
  chartDimensions: Dimensions,
  settingsSpec: SettingsSpec,
  xScale: Scale | undefined,
  seriesSpecs: BasicSeriesSpec[],
  totalBarsInCluster: number,
  isTooltipSnapEnabled: boolean,
  geometriesIndexKeys: any[],
): Dimensions & { visible: boolean } | undefined {
  // update che cursorBandPosition based on chart configuration
  const isLineAreaOnly = isLineAreaOnlyChart(seriesSpecs);
  if (!xScale) {
    return;
  }
  const xValue = xScale.invertWithStep(axisCursorPosition.x, geometriesIndexKeys);
  return getCursorBandPosition(
    settingsSpec.rotation,
    chartDimensions,
    axisCursorPosition,
    {
      value: xValue.value,
      withinBandwidth: true,
    },
    isTooltipSnapEnabled,
    xScale,
    isLineAreaOnly ? 1 : totalBarsInCluster,
  );
}
