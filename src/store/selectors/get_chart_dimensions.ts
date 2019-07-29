import createCachedSelector from 're-reselect';
import { IChartState } from '../chart_store';
import { Dimensions } from '../../utils/dimensions';

const getState = (state: IChartState) => state;
const getChartStore = (state: IChartState) => state.chartStore;
const isInitialized = (state: IChartState) => state.initialized;

export const getChartDimensionsSelector = createCachedSelector(
  [isInitialized, getChartStore, getState],
  (isInitialized, chartStore, state): Dimensions => {
    if (!isInitialized || !chartStore) {
      return {
        height: 0,
        width: 0,
        left: 0,
        top: 0,
      };
    }
    return chartStore.getChartDimensions(state);
  },
)((state) => state.chartId);
