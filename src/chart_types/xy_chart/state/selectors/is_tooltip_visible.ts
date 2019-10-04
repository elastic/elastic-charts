import createCachedSelector from 're-reselect';
import { TooltipType, TooltipValue, isTooltipType, isTooltipProps } from '../../utils/interactions';
import { Point } from '../../../../utils/point';
import { GlobalChartState } from '../../../../state/chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeCursorPositionSelector } from './compute_cursor_position';
import { getTooltipValuesSelector } from './get_tooltip_values_highlighted_geoms';
import { isBrushingSelector } from './is_brushing';

const getTooltipType = (state: GlobalChartState): TooltipType | undefined => {
  const tooltip = getSettingsSpecSelector(state).tooltip;
  if (!tooltip) {
    return undefined;
  }
  if (isTooltipType(tooltip)) {
    return tooltip;
  }
  if (isTooltipProps(tooltip)) {
    return tooltip.type;
  }
};

export const isTooltipVisibleSelector = createCachedSelector(
  [isBrushingSelector, getTooltipType, computeCursorPositionSelector, getTooltipValuesSelector],
  isTooltipVisible,
)((state) => state.chartId);

function isTooltipVisible(
  isBrushing: boolean,
  tooltipType: TooltipType | undefined,
  cursorPosition: Point,
  tooltipValues: TooltipValue[],
) {
  return (
    !isBrushing &&
    tooltipType !== TooltipType.None &&
    cursorPosition.x > -1 &&
    cursorPosition.y > -1 &&
    tooltipValues.length > 0
  );
}
