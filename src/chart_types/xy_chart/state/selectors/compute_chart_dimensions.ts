import createCachedSelector from 're-reselect';
import { getChartThemeSelector } from '../../../../store/selectors/get_chart_theme';
import { getAxisSpecsSelector } from './get_specs';
import { computeChartDimensions } from '../../utils/dimensions';
import { GlobalChartState } from '../../../../store/chart_store';
import { computeAxisTicksDimensionsSelector } from './compute_axis_ticks_dimensions';
import { Dimensions } from '../../../../utils/dimensions';

const getParentDimension = (state: GlobalChartState) => state.settings.parentDimensions;

export const computeChartDimensionsSelector = createCachedSelector(
  [getParentDimension, getChartThemeSelector, computeAxisTicksDimensionsSelector, getAxisSpecsSelector],
  (
    parentDimensions,
    chartTheme,
    axesTicksDimensions,
    axesSpecs,
  ): {
    chartDimensions: Dimensions;
    leftMargin: number;
  } => {
    // console.log('--- 6 computeChartDimensions ---');
    return computeChartDimensions(parentDimensions, chartTheme, axesTicksDimensions, axesSpecs);
  },
)((state) => state.chartId);
