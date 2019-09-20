import { Dimensions } from 'utils/dimensions';
import createCachedSelector from 're-reselect';
import { Point } from 'utils/point';
import { Scale } from '../../../../utils/scales/scales';
import { isLineAreaOnlyChart } from '../utils';
import { getCursorBandPosition } from '../../crosshair/crosshair_utils';
import { SettingsSpec } from '../../../../specs/settings';
import { getSettingsSpecSelector } from '../../../../store/selectors/get_settings_specs';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { BasicSeriesSpec } from 'chart_types/xy_chart/utils/specs';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import { getSeriesSpecsSelector } from './get_specs';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { getAxisCursorPositionSelector } from './get_axis_cursor_position';
import { isTooltipSnapEnableSelector } from './is_tooltip_snap_enabled';

export const getCursorBandPositionSelector = createCachedSelector(
  [
    getAxisCursorPositionSelector,
    computeChartDimensionsSelector,
    getSettingsSpecSelector,
    computeSeriesGeometriesSelector,
    getSeriesSpecsSelector,
    countBarsInClusterSelector,
    isTooltipSnapEnableSelector,
  ],
  (
    axisCursorPosition,
    chartDimensions,
    settingsSpec,
    seriesGeometries,
    seriesSpec,
    totalBarsInCluster,
    isTooltipSnapEnabled,
  ) => {
    return getCursorBand(
      axisCursorPosition,
      chartDimensions.chartDimensions,
      settingsSpec,
      seriesGeometries.scales.xScale,
      seriesSpec,
      totalBarsInCluster,
      isTooltipSnapEnabled,
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
) {
  // update che cursorBandPosition based on chart configuration
  const isLineAreaOnly = isLineAreaOnlyChart(seriesSpecs);
  if (!xScale) {
    return;
  }
  return getCursorBandPosition(
    settingsSpec.rotation,
    chartDimensions,
    axisCursorPosition,
    {
      value: 0,
      withinBandwidth: true,
    },
    isTooltipSnapEnabled,
    xScale,
    isLineAreaOnly ? 1 : totalBarsInCluster,
  );
}
