import { GlobalChartState } from '../chart_store';
import { TooltipLegendValue } from 'chart_types/xy_chart/tooltip/tooltip';

export const getLegendItemsValuesSelector = (state: GlobalChartState): Map<string, TooltipLegendValue> => {
  if (state.internalChartState) {
    return state.internalChartState.getLegendItemsValues(state);
  } else {
    return new Map<string, TooltipLegendValue>();
  }
};
