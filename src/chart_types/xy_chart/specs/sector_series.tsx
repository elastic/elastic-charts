import { SectorSeriesSpec, DEFAULT_GLOBAL_ID } from '../utils/specs';
import { ScaleType } from '../../../utils/scales/scales';
import { ChartTypes } from '../../../chart_types';
import { specComponentFactory, getConnect } from '../../../state/spec_factory';

const defaultProps = {
  chartType: ChartTypes.XYAxis,
  specType: 'series' as 'series',
  seriesType: 'sector' as 'sector',
  groupId: DEFAULT_GLOBAL_ID,
  xScaleType: ScaleType.Ordinal,
  yScaleType: ScaleType.Polar,
  xAccessor: 'x',
  yAccessors: ['y'],
  yScaleToDataExtent: false,
  hideInLegend: false,
  enableHistogramMode: false,
};

export const SectorSeries = getConnect()(
  specComponentFactory<
    SectorSeriesSpec,
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
