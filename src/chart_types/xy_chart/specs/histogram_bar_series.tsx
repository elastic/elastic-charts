import { HistogramBarSeriesSpec, DEFAULT_GLOBAL_ID } from '../utils/specs';
import { ScaleType } from '../../../utils/scales/scales';
import { specComponentFactory, getConnect } from '../../../store/spec_factory';
import { ChartTypes } from 'chart_types';

const defaultProps = {
  chartType: ChartTypes.XYAxis,
  specType: 'series' as 'series',
  seriesType: 'bar' as 'bar',
  groupId: DEFAULT_GLOBAL_ID,
  xScaleType: ScaleType.Ordinal,
  yScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  yScaleToDataExtent: false,
  hideInLegend: false,
  enableHistogramMode: true as true,
};

export const HistogramBarSeries = getConnect()(
  specComponentFactory<
    HistogramBarSeriesSpec,
    | 'seriesType'
    | 'groupId'
    | 'xScaleType'
    | 'yScaleType'
    | 'xAccessor'
    | 'yAccessors'
    | 'yScaleToDataExtent'
    | 'hideInLegend'
    | 'enableHistogramMode'
  >(defaultProps),
);
