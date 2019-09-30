import createCachedSelector from 're-reselect';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { countBarsInCluster } from '../../utils/scales';

export const countBarsInClusterSelector = createCachedSelector(
  [computeSeriesDomainsSelector],
  (seriesDomainsAndData): number => {
    const { formattedDataSeries } = seriesDomainsAndData;

    const { totalBarsInCluster } = countBarsInCluster(formattedDataSeries.stacked, formattedDataSeries.nonStacked);
    // console.log('--- 4 countBarsInCluster ---');
    return totalBarsInCluster;
  },
)((state) => state.chartId);
