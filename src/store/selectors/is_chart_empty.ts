import { GlobalChartState } from '../chart_store';

export const isInternalChartEmptySelector = (state: GlobalChartState): boolean | undefined => {
  if (state.internalChartState) {
    return state.internalChartState.isChartEmpty(state);
  } else {
    return undefined;
  }
};
