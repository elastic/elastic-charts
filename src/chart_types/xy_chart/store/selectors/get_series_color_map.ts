import createCachedSelector from 're-reselect';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { getSeriesSpecsSelector } from './get_specs';
import { getUpdatedCustomSeriesColors } from '../utils';
import { getSeriesColorMap } from '../../../../chart_types/xy_chart/utils/series';
import { getChartThemeSelector } from '../../../../store/selectors/get_chart_theme';

export const getSeriesColorMapSelector = createCachedSelector(
  [getSeriesSpecsSelector, computeSeriesDomainsSelector, getChartThemeSelector],
  (seriesSpecs, seriesDomainsAndData, chartTheme): Map<string, string> => {
    console.log({ seriesDomainsAndData, chartTheme });

    const updatedCustomSeriesColors = getUpdatedCustomSeriesColors(seriesSpecs);
    // TODO merge with existing custom series color
    // const customSeriesColors = new Map([...this.customSeriesColors, ...updatedCustomSeriesColors]);

    const seriesColorMap = getSeriesColorMap(
      seriesDomainsAndData.seriesColors,
      chartTheme.colors,
      updatedCustomSeriesColors,
    );
    console.log('--- 2 computeSeriesDomainsSelector ---');
    return seriesColorMap;
  },
)((state) => state.chartId);
