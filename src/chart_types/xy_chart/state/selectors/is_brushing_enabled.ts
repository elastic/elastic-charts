import createCachedSelector from 're-reselect';
import { isBrushAvailableSelector } from './is_brush_available';
import { computeCursorPositionSelector } from './compute_cursor_position';

export const isBrushingEnabledSelector = createCachedSelector(
  [isBrushAvailableSelector, computeCursorPositionSelector],
  (isBrushAvailable, cursorPosition): boolean => {
    if (!isBrushAvailable) {
      return false;
    }

    return cursorPosition.x > -1 && cursorPosition.y > -1;
  },
)((state) => state.chartId);
