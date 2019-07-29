import createCachedSelector from 're-reselect';
import { computeCursorPositionSelector } from './compute_cursor_position';
import { IChartState } from 'store/chart_store';
import { isBrushingEnabledSelector } from './is_brushing_enabled';

const getMouseDownPositionSelector = (state: IChartState) => state.interactions.mouseDownPosition;

export const isBrushingSelector = createCachedSelector(
  [isBrushingEnabledSelector, getMouseDownPositionSelector, computeCursorPositionSelector],
  (isBrushAvailable, mouseDownPosition, cursorPosition): boolean => {
    if (!isBrushAvailable) {
      return false;
    }

    return (
      mouseDownPosition !== null &&
      Math.abs(mouseDownPosition.x - cursorPosition.x) > 0 &&
      Math.abs(mouseDownPosition.y - cursorPosition.y) > 0
    );
  },
)((state) => state.chartId);
