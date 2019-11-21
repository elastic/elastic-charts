import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../../../../state/chart_state';
import { getSpecsFromStore } from '../../../../state/utils';
import { AxisSpec, BasicSeriesSpec, AnnotationSpec } from '../../utils/specs';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';

const getSpecs = (state: GlobalChartState) => state.specs;

export const getAxisSpecsSelector = createCachedSelector(
  [getSpecs],
  (specs): AxisSpec[] => {
    return getSpecsFromStore<AxisSpec>(specs, 'xy_axis', 'axis');
  },
)(getChartIdSelector);

export const getSeriesSpecsSelector = createCachedSelector([getSpecs], (specs) => {
  const seriesSpec = getSpecsFromStore<BasicSeriesSpec>(specs, 'xy_axis', 'series');
  return seriesSpec;
})(getChartIdSelector);

export const getAnnotationSpecsSelector = createCachedSelector([getSpecs], (specs) => {
  return getSpecsFromStore<AnnotationSpec>(specs, 'xy_axis', 'annotation');
})(getChartIdSelector);
