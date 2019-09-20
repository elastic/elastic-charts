import createCachedSelector from 're-reselect';
import { computeLegendSelector } from './compute_legend';

export const isLegendInitializedSelector = createCachedSelector(
  [computeLegendSelector],
  (legendItems): boolean => {
    return legendItems.size > 0;
  },
)((state) => state.chartId);
