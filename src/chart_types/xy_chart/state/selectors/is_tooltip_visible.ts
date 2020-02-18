import createCachedSelector from 're-reselect';
import { Point } from '../../../../utils/point';
import { GlobalChartState, PointerStates } from '../../../../state/chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getProjectedPointerPositionSelector } from './get_projected_pointer_position';
import { getTooltipValuesSelector, TooltipData } from './get_tooltip_values_highlighted_geoms';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getTooltipType } from './get_tooltip_type';
import { TooltipType } from '../../../../specs';
import { isAnnotationTooltipVisibleSelector } from './is_annotation_tooltip_visible';

const hasTooltipTypeDefinedSelector = (state: GlobalChartState): TooltipType | undefined => {
  return getTooltipType(getSettingsSpecSelector(state));
};

const getPointerSelector = (state: GlobalChartState) => state.interactions.pointer;

export const isTooltipVisibleSelector = createCachedSelector(
  [
    hasTooltipTypeDefinedSelector,
    getPointerSelector,
    getProjectedPointerPositionSelector,
    getTooltipValuesSelector,
    isAnnotationTooltipVisibleSelector,
  ],
  isTooltipVisible,
)(getChartIdSelector);

function isTooltipVisible(
  tooltipType: TooltipType | undefined,
  pointer: PointerStates,
  projectedPointerPosition: Point,
  tooltip: TooltipData,
  isAnnotationTooltipVisible: boolean,
) {
  return (
    tooltipType !== TooltipType.None &&
    pointer.down === null &&
    projectedPointerPosition.x > -1 &&
    projectedPointerPosition.y > -1 &&
    tooltip.values.length > 0 &&
    !isAnnotationTooltipVisible
  );
}
