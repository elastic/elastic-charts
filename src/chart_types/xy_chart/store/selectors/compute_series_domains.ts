import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from 'store/selectors/get_settings_specs';
import { getSeriesSpecsSelector } from './get_specs';
import { mergeYCustomDomainsByGroupIdSelector } from './merge_y_custom_domains';
import { computeSeriesDomains } from '../utils';
import { SeriesDomainsAndData } from '../utils';
import { IChartState } from 'store/chart_store';

const getDeselectedSeriesSelector = (state: IChartState) => state.interactions.deselectedDataSeries;

export const computeSeriesDomainsSelector = createCachedSelector(
  [getSeriesSpecsSelector, mergeYCustomDomainsByGroupIdSelector, getDeselectedSeriesSelector, getSettingsSpecSelector],
  (seriesSpecs, customYDomainsByGroupId, deselectedDataSeries, settingsSpec): SeriesDomainsAndData => {
    console.log('--- 1 computeSeriesDomainsSelector ---', seriesSpecs);
    const domains = computeSeriesDomains(
      seriesSpecs,
      customYDomainsByGroupId,
      deselectedDataSeries,
      settingsSpec.xDomain,
    );
    console.log({ domains });
    return domains;
  },
)((state) => state.chartId);
