import createCachedSelector from 're-reselect';
import { computeCursorPositionSelector } from './compute_cursor_position';
import { IChartState } from '../../../../store/chart_store';
import { isBrushingEnabledSelector } from './is_brushing_enabled';

const getPointerSelector = (state: IChartState) => state.interactions.pointer;

export const isBrushingSelector = createCachedSelector(
  [isBrushingEnabledSelector, getPointerSelector, computeCursorPositionSelector],
  (isBrushAvailable, pointer, cursorPosition): boolean => {
    if (!isBrushAvailable) {
      return false;
    }

    return (
      pointer.down !== null &&
      pointer.up === null &&
      Math.abs(pointer.down.position.x - cursorPosition.x) > 0 &&
      Math.abs(pointer.down.position.y - cursorPosition.y) > 0
    );
  },
)((state) => state.chartId);
