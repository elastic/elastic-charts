import { computeLegendSelector } from './compute_legend';
import createCachedSelector from 're-reselect';

export const isLegendInitializedSelector = createCachedSelector(
  [computeLegendSelector],
  (legendItems): boolean => {
    return legendItems.size > 0;
  },
)((state) => state.chartId);
