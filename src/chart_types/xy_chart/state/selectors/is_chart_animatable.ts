import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
// import { isChartAnimatable } from '../utils';

export const isChartAnimatableSelector = createCachedSelector(
  [computeSeriesGeometriesSelector, getSettingsSpecSelector],
  () => {
    // console.log('--- 13 isChartAnimatableSelector ---');
    // const { geometriesCounts } = seriesGeometries;
    // temporary disabled until
    // https://github.com/elastic/elastic-charts/issues/89 and https://github.com/elastic/elastic-charts/issues/41
    // return isChartAnimatable(geometriesCounts, settingsSpec.animateData);
    return false;
  },
)((state) => state.chartId);
