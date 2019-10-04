import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../chart_state';
import { Dimensions } from '../../utils/dimensions';

const getState = (state: GlobalChartState) => state;
const getChartStore = (state: GlobalChartState) => state.internalChartState;
const isInitialized = (state: GlobalChartState) => state.initialized;

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
