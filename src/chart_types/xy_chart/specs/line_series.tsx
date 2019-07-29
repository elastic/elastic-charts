import { LineSeriesSpec, DEFAULT_GLOBAL_ID, HistogramModeAlignments } from '../utils/specs';
import { ScaleType } from '../../../utils/scales/scales';
import { ChartTypes } from 'chart_types';
import { specComponentFactory, getConnect } from '../../../store/spec_factory';

const defaultProps = {
  chartType: ChartTypes.XYAxis,
  specType: 'series' as 'series',
  seriesType: 'line' as 'line',
  groupId: DEFAULT_GLOBAL_ID,
  xScaleType: ScaleType.Ordinal,
  yScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  yScaleToDataExtent: false,
  hideInLegend: false,
  histogramModeAlignment: HistogramModeAlignments.Center,
};

export const LineSeries = getConnect()(
  specComponentFactory<
    LineSeriesSpec,
    | 'seriesType'
    | 'groupId'
    | 'xScaleType'
    | 'yScaleType'
    | 'xAccessor'
    | 'yAccessors'
    | 'yScaleToDataExtent'
    | 'hideInLegend'
    | 'histogramModeAlignment'
  >(defaultProps),
);
