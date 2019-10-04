import { AreaSeriesSpec, HistogramModeAlignments, DEFAULT_GLOBAL_ID } from '../utils/specs';
import { ScaleType } from '../../../utils/scales/scales';
import { specComponentFactory, getConnect } from '../../../state/spec_factory';
import { ChartTypes } from '../../../chart_types';

const defaultProps = {
  chartType: ChartTypes.XYAxis,
  specType: 'series' as 'series',
  seriesType: 'area' as 'area',
  groupId: DEFAULT_GLOBAL_ID,
  xScaleType: ScaleType.Ordinal,
  yScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  yScaleToDataExtent: false,
  hideInLegend: false,
  histogramModeAlignment: HistogramModeAlignments.Center,
};

export const AreaSeries = getConnect()(
  specComponentFactory<
    AreaSeriesSpec,
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
