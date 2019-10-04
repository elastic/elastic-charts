import { GlobalChartState } from '../chart_state';

export const getInternalChartRendererSelector = (state: GlobalChartState): JSX.Element | null => {
  if (state.internalChartState) {
    return state.internalChartState.chartRenderer(state);
  } else {
    return null;
  }
};
