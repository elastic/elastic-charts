import createCachedSelector from 're-reselect';
import { isAllSeriesDeselected } from '../utils';
import { computeLegendSelector } from './compute_legend';
export const isChartEmptySelector = createCachedSelector(
  [computeLegendSelector],
  (legendItems): boolean => {
    return isAllSeriesDeselected(legendItems);
  },
)((state) => state.chartId);
