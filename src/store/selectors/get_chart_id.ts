import { GlobalChartState } from '../chart_store';

export const getChartIdSelector = (state: GlobalChartState) => state.chartId;
