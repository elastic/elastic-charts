import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getTooltipPosition, TooltipPosition } from '../../crosshair/crosshair_utils';
import { computeCursorPositionSelector } from './compute_cursor_position';
import { getComputedScalesSelector } from './get_computed_scales';
import { getCursorBandPositionSelector } from './get_cursor_band';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';

export const getTooltipPositionSelector = createCachedSelector(
  [
    computeChartDimensionsSelector,
    getSettingsSpecSelector,
    getCursorBandPositionSelector,
    computeCursorPositionSelector,
    getComputedScalesSelector,
  ],
  ({ chartDimensions }, settings, cursorBandPosition, cursorPosition, scales): TooltipPosition | null => {
    if (!cursorBandPosition) {
      return null;
    }
    return getTooltipPosition(
      chartDimensions,
      settings.rotation,
      cursorBandPosition,
      cursorPosition,
      scales.xScale.isSingleValue(),
    );
  },
)((state) => state.chartId);
