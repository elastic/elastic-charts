import createCachedSelector from 're-reselect';
import { TooltipType, isCrosshairTooltipType } from '../../utils/interactions';
import { Point } from '../../../../utils/point';
import { computeCursorPositionSelector } from './compute_cursor_position';
import { getTooltipTypeSelector } from './get_tooltip_type';
import { isBrushingSelector } from './is_brushing';

export const isCrosshairVisibleSelector = createCachedSelector(
  [isBrushingSelector, getTooltipTypeSelector, computeCursorPositionSelector],
  isCrosshairVisible,
)((state) => state.chartId);

function isCrosshairVisible(isBrushing: boolean, tooltipType: TooltipType | undefined, cursorPosition: Point) {
  return (
    !isBrushing &&
    tooltipType !== undefined &&
    isCrosshairTooltipType(tooltipType) &&
    cursorPosition.x > -1 &&
    cursorPosition.y > -1
  );
}
