import createCachedSelector from 're-reselect';
import { TooltipType, isCrosshairTooltipType } from '../../utils/interactions';
import { Point } from '../../../../utils/point';
import { getProjectedPointerPositionSelector } from './get_projected_pointer_position';
import { getTooltipTypeSelector } from './get_tooltip_type';
import { isBrushingSelector } from './is_brushing';

export const isCrosshairVisibleSelector = createCachedSelector(
  [isBrushingSelector, getTooltipTypeSelector, getProjectedPointerPositionSelector],
  isCrosshairVisible,
)((state) => state.chartId);

function isCrosshairVisible(
  isBrushing: boolean,
  tooltipType: TooltipType | undefined,
  projectedPointerPosition: Point,
) {
  return (
    !isBrushing &&
    tooltipType !== undefined &&
    isCrosshairTooltipType(tooltipType) &&
    projectedPointerPosition.x > -1 &&
    projectedPointerPosition.y > -1
  );
}
