import createCachedSelector from 're-reselect';
import { TooltipType, TooltipValue, isTooltipType, isTooltipProps } from '../../utils/interactions';
import { Point } from '../../../../utils/point';
import { GlobalChartState, PointerStates } from '../../../../state/chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeCursorPositionSelector } from './compute_cursor_position';
import { getTooltipValuesSelector } from './get_tooltip_values_highlighted_geoms';

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
const getPointerSelector = (state: GlobalChartState) => state.interactions.pointer;

export const isTooltipVisibleSelector = createCachedSelector(
  [getTooltipType, getPointerSelector, computeCursorPositionSelector, getTooltipValuesSelector],
  isTooltipVisible,
)((state) => state.chartId);

function isTooltipVisible(
  tooltipType: TooltipType | undefined,
  pointer: PointerStates,
  cursorPosition: Point,
  tooltipValues: TooltipValue[],
) {
  return (
    tooltipType !== TooltipType.None &&
    pointer.down === null &&
    cursorPosition.x > -1 &&
    cursorPosition.y > -1 &&
    tooltipValues.length > 0
  );
}
