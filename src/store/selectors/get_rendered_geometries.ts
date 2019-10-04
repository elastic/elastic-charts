import createCachedSelector from 're-reselect';
import { GlobalChartState, GeometriesList } from '../chart_store';

const getState = (state: GlobalChartState) => state;
const getChartStore = (state: GlobalChartState) => state.internalChartState;
const isInitialized = (state: GlobalChartState) => state.initialized;

export const getRenderedGeometriesSelector = createCachedSelector(
  [isInitialized, getChartStore, getState],
  (isInitialized, chartStore, state): GeometriesList => {
    if (!isInitialized || !chartStore) {
      return {};
    }
    return chartStore.render(state);
  },
)((state) => state.chartId);
