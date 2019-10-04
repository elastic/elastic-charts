import { GlobalChartState } from '../chart_state';
import { LegendItem } from '../../components/legend/legend';

export const getLegendItemsSelector = (state: GlobalChartState): Map<string, LegendItem> => {
  if (state.internalChartState) {
    return state.internalChartState.getLegendItems(state);
  } else {
    return new Map<string, LegendItem>();
  }
};
