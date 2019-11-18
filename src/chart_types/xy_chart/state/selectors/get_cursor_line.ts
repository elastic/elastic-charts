import createCachedSelector from 're-reselect';
import { getCursorLinePosition } from '../../crosshair/crosshair_utils';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getProjectedPointerPositionSelector } from './get_projected_pointer_position';

export const getCursorLinePositionSelector = createCachedSelector(
  [computeChartDimensionsSelector, getSettingsSpecSelector, getProjectedPointerPositionSelector],
  (chartDimensions, settingsSpec, projectedPointerPosition) => {
    return getCursorLinePosition(settingsSpec.rotation, chartDimensions.chartDimensions, projectedPointerPosition);
  },
)((state) => state.chartId);
