import createCachedSelector from 're-reselect';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getAxisSpecsSelector } from './get_specs';
import { computeChartDimensions } from '../../utils/dimensions';
import { GlobalChartState } from '../../../../state/chart_state';
import { computeAxisTicksDimensionsSelector } from './compute_axis_ticks_dimensions';
import { Dimensions } from '../../../../utils/dimensions';

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

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
    return computeChartDimensions(parentDimensions, chartTheme, axesTicksDimensions, axesSpecs);
  },
)((state) => state.chartId);
