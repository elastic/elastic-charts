import createCachedSelector from 're-reselect';
import { IChartState } from '../../../../store/chart_store';
import { getSpecsFromStore } from '../../../../store/utils';
import { AxisSpec, BasicSeriesSpec, AnnotationSpec } from '../../utils/specs';
import { getChartIdSelector } from '../../../../store/selectors/get_chart_id';

const getSpecs = (state: IChartState) => state.specs;

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
