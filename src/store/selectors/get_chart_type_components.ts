import { IChartState, GetCustomChartComponent } from '../chart_store';

export const getChartTypeComponentSelector = (state: IChartState): GetCustomChartComponent | undefined => {
  if (state.chartStore) {
    return state.chartStore.getCustomChartComponents;
  } else {
    return undefined;
  }
};
