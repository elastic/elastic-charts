import createCachedSelector from 're-reselect';
import { computeBrushExtent, BrushExtent } from '../utils';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeChartTransformSelector } from './compute_chart_transform';

export const computeBrushExtentSelector = createCachedSelector(
  [computeChartDimensionsSelector, computeChartTransformSelector, getSettingsSpecSelector],
  (chartDimensions, chartTransform, settingsSpecs): BrushExtent => {
    // console.log('--- 8 computeBrushExtentSelector ---');
    return computeBrushExtent(chartDimensions.chartDimensions, settingsSpecs.rotation, chartTransform);
  },
)((state) => state.chartId);
