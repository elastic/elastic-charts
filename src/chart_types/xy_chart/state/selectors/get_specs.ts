import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../../../../state/chart_state';
import { getSpecsFromStore } from '../../../../state/utils';
import { AxisSpec, BasicSeriesSpec, AnnotationSpec } from '../../utils/specs';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';

const getSpecs = (state: GlobalChartState) => state.specs;

export const getAxisSpecsSelector = createCachedSelector(
  [getChartIdSelector, getSpecs],
  (_, specs): AxisSpec[] => {
    return getSpecsFromStore<AxisSpec>(specs, 'xy_axis', 'axis');
  },
)((state) => state.chartId);

export const getSeriesSpecsSelector = createCachedSelector([getChartIdSelector, getSpecs], (chartId, specs) => {
  const seriesSpec = getSpecsFromStore<BasicSeriesSpec>(specs, 'xy_axis', 'series');
  return seriesSpec;
})((state) => state.chartId);

export const getAnnotationSpecsSelector = createCachedSelector([getChartIdSelector, getSpecs], (chartId, specs) => {
  return getSpecsFromStore<AnnotationSpec>(specs, 'xy_axis', 'annotation');
})((state) => state.chartId);
