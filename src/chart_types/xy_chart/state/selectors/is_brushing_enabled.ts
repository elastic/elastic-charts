import createCachedSelector from 're-reselect';
import { isBrushAvailableSelector } from './is_brush_available';
import { getProjectedPointerPositionSelector } from './get_projected_pointer_position';

export const isBrushingEnabledSelector = createCachedSelector(
  [isBrushAvailableSelector, getProjectedPointerPositionSelector],
  (isBrushAvailable, projectedPointerPosition): boolean => {
    if (!isBrushAvailable) {
      return false;
    }

    return projectedPointerPosition.x > -1 && projectedPointerPosition.y > -1;
  },
)((state) => state.chartId);
