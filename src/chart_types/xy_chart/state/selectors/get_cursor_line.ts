import createCachedSelector from 're-reselect';
import { getCursorLinePosition } from '../../crosshair/crosshair_utils';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeCursorPositionSelector } from './compute_cursor_position';

export const getCursorLinePositionSelector = createCachedSelector(
  [computeChartDimensionsSelector, getSettingsSpecSelector, computeCursorPositionSelector],
  (chartDimensions, settingsSpec, cursorPosition) => {
    return getCursorLinePosition(settingsSpec.rotation, chartDimensions.chartDimensions, cursorPosition);
  },
)((state) => state.chartId);
