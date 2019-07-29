import createCachedSelector from 're-reselect';
import { getChartDimensionsSelector } from 'store/selectors/get_chart_dimensions';
import { getSettingsSpecSelector } from 'store/selectors/get_settings_specs';
import { getTooltipPosition } from 'chart_types/xy_chart/crosshair/crosshair_utils';
import { computeCursorPositionSelector } from './compute_cursor_position';
import { getComputedScalesSelector } from './get_computed_scales';
import { getCursorBandPositionSelector } from './get_cursor_band';

export const getTooltipPositionSelector = createCachedSelector(
  [
    getChartDimensionsSelector,
    getSettingsSpecSelector,
    getCursorBandPositionSelector,
    computeCursorPositionSelector,
    getComputedScalesSelector,
  ],
  (chartDimensions, settings, cursorBandPosition, cursorPosition, scales): { transform: string } => {
    if (!cursorBandPosition) {
      return { transform: '' };
    }
    const transform = getTooltipPosition(
      chartDimensions,
      settings.rotation,
      cursorBandPosition,
      cursorPosition,
      scales.xScale.isSingleValue(),
    );
    return { transform };
  },
)((state) => state.chartId);
