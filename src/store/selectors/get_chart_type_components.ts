import { IChartState } from '../chart_store';

export const getChartTypeComponentSelector = (zIndex: number, type: 'dom' | 'svg' | 'canvas') => (
  state: IChartState,
): JSX.Element | null => {
  if (state.chartStore) {
    return state.chartStore.getCustomChartComponents(zIndex, type);
  } else {
    return null;
  }
};
