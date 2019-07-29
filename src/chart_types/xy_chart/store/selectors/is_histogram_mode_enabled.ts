import createCachedSelector from 're-reselect';
import { getSeriesSpecsSelector } from './get_specs';
import { isHistogramModeEnabled } from '../utils';

export const isHistogramModeEnabledSelector = createCachedSelector(
  [getSeriesSpecsSelector],
  (seriesSpecs): boolean => {
    return isHistogramModeEnabled(seriesSpecs);
  },
)((state) => state.chartId);
