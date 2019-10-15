import createCachedSelector from 're-reselect';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { getSeriesSpecsSelector, getAxisSpecsSelector } from './get_specs';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSeriesColorMapSelector } from './get_series_color_map';
import { computeLegend, LegendItem } from '../../legend/legend';
import { GlobalChartState } from '../../../../state/chart_state';

const getDeselectedSeriesSelector = (state: GlobalChartState) => state.interactions.deselectedDataSeries;

export const computeLegendSelector = createCachedSelector(
  [
    getSeriesSpecsSelector,
    computeSeriesDomainsSelector,
    getChartThemeSelector,
    getSeriesColorMapSelector,
    getAxisSpecsSelector,
    getDeselectedSeriesSelector,
  ],
  (
    seriesSpecs,
    seriesDomainsAndData,
    chartTheme,
    seriesColorMap,
    axesSpecs,
    deselectedDataSeries,
  ): Map<string, LegendItem> => {
    // console.log('--- 3 computeLegend ---');

    return computeLegend(
      seriesDomainsAndData.seriesColors,
      seriesColorMap,
      seriesSpecs,
      chartTheme.colors.defaultVizColor,
      axesSpecs,
      deselectedDataSeries,
    );
  },
)((state) => state.chartId);
