import { BarSeriesSpec, DEFAULT_GLOBAL_ID } from '../utils/specs';
import { ScaleType } from '../../../utils/scales/scales';
import { ChartTypes } from '../../../chart_types';
import { specComponentFactory, getConnect } from '../../../state/spec_factory';

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
  enableHistogramMode: false,
};

export const BarSeries = getConnect()(
  specComponentFactory<
    BarSeriesSpec,
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
