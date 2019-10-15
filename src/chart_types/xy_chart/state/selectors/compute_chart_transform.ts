import createCachedSelector from 're-reselect';
import { computeChartTransform, Transform } from '../utils';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';

export const computeChartTransformSelector = createCachedSelector(
  [computeChartDimensionsSelector, getSettingsSpecSelector],
  (chartDimensions, settingsSpecs): Transform => {
    // console.log('--- 7 computeChartTransformSelector ---');
    return computeChartTransform(chartDimensions.chartDimensions, settingsSpecs.rotation);
  },
)((state) => state.chartId);
