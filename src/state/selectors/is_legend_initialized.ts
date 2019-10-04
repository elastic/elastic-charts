import { GlobalChartState } from '../chart_state';

export const isLegendInitializedSelector = (state: GlobalChartState): boolean | undefined => {
  if (state.internalChartState) {
    return state.internalChartState.getLegendItems(state).size > 0;
  } else {
    return false;
  }
};
