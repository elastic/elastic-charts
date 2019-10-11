import { GlobalChartState } from '../chart_state';
import { LegendItem } from '../../chart_types/xy_chart/legend/legend';

export const getLegendItemsSelector = (state: GlobalChartState): Map<string, LegendItem> => {
  if (state.internalChartState) {
    return state.internalChartState.getLegendItems(state);
  } else {
    return new Map<string, LegendItem>();
  }
};
