import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getHighlightedGeomsSelector } from './get_tooltip_values_highlighted_geoms';
import { GlobalChartState } from '../../../../state/chart_state';
import { isBrushAvailableSelector } from './is_brush_available';

const getRawCursorPositionSelector = (state: GlobalChartState) => state.interactions.rawCursorPosition;

export const getCursorPointerSelector = createCachedSelector(
  [
    getHighlightedGeomsSelector,
    getSettingsSpecSelector,
    getRawCursorPositionSelector,
    computeChartDimensionsSelector,
    isBrushAvailableSelector,
  ],
  (highlightedGeometries, settingsSpec, rawCursorPosition, { chartDimensions }, isBrushAvailable): string => {
    const { x, y } = rawCursorPosition;
    // get positions relative to chart
    const xPos = x - chartDimensions.left;
    const yPos = y - chartDimensions.top;

    // limit cursorPosition to chartDimensions
    if (xPos < 0 || xPos >= chartDimensions.width) {
      return 'default';
    }
    if (yPos < 0 || yPos >= chartDimensions.height) {
      return 'default';
    }
    if (highlightedGeometries.length > 0 && (settingsSpec.onElementClick || settingsSpec.onElementOver)) {
      return 'pointer';
    }
    return isBrushAvailable ? 'crosshair' : 'default';
  },
)((state) => state.chartId);
