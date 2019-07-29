import { IChartState } from '../chart_store';

export const getChartIdSelector = (state: IChartState) => state.chartId;
