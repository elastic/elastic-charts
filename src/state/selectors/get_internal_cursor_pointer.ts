import { GlobalChartState } from '../chart_state';

export const getInternalCursorPointer = (state: GlobalChartState): string => {
  if (state.internalChartState) {
    return state.internalChartState.getCursorPointer(state);
  } else {
    return 'default';
  }
};
