import { mergePartial } from '../../utils/commons';
import {
  DEFAULT_GLOBAL_ID,
  BarSeriesSpec,
  AreaSeriesSpec,
  HistogramModeAlignments,
  HistogramBarSeriesSpec,
  LineSeriesSpec,
  BasicSeriesSpec,
} from '../../chart_types/xy_chart/utils/specs';
import { getSpecId, getGroupId, SpecId } from '../../utils/ids';
import { ScaleType } from '../../utils/scales/scales';

export type SeriesSpecs = Map<SpecId, BasicSeriesSpec>;

export class MockSeriesSpec {
  private static readonly barBase: BarSeriesSpec = {
    id: getSpecId('spec1'),
    seriesType: 'bar',
    groupId: getGroupId(DEFAULT_GLOBAL_ID),
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    splitSeriesAccessors: ['g'],
    yScaleToDataExtent: false,
    hideInLegend: false,
    enableHistogramMode: false,
    stackAsPercentage: false,
    data: [],
  };

  private static readonly histogramBarBase: HistogramBarSeriesSpec = {
    id: getSpecId('spec1'),
    seriesType: 'bar',
    groupId: getGroupId(DEFAULT_GLOBAL_ID),
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    yScaleToDataExtent: false,
    hideInLegend: false,
    enableHistogramMode: true,
    data: [],
  };

  private static readonly areaBase: AreaSeriesSpec = {
    id: getSpecId('spec1'),
    seriesType: 'area',
    groupId: getGroupId(DEFAULT_GLOBAL_ID),
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    yScaleToDataExtent: false,
    hideInLegend: false,
    histogramModeAlignment: HistogramModeAlignments.Center,
    data: [],
  };

  private static readonly lineBase: LineSeriesSpec = {
    id: getSpecId('spec1'),
    seriesType: 'line',
    groupId: getGroupId(DEFAULT_GLOBAL_ID),
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    yScaleToDataExtent: false,
    hideInLegend: false,
    histogramModeAlignment: HistogramModeAlignments.Center,
    data: [],
  };

  static bar(partial?: Partial<BarSeriesSpec>): BarSeriesSpec {
    return mergePartial<BarSeriesSpec>(MockSeriesSpec.barBase, partial, { mergeOptionalPartialValues: true });
  }

  static histogramBar(partial?: Partial<HistogramBarSeriesSpec>): HistogramBarSeriesSpec {
    return mergePartial<HistogramBarSeriesSpec>(MockSeriesSpec.histogramBarBase, partial, {
      mergeOptionalPartialValues: true,
    });
  }

  static area(partial?: Partial<AreaSeriesSpec>): AreaSeriesSpec {
    return mergePartial<AreaSeriesSpec>(MockSeriesSpec.areaBase, partial, { mergeOptionalPartialValues: true });
  }

  static line(partial?: Partial<LineSeriesSpec>): LineSeriesSpec {
    return mergePartial<LineSeriesSpec>(MockSeriesSpec.lineBase, partial, { mergeOptionalPartialValues: true });
  }

  static byType(type?: 'line' | 'bar' | 'area'): BasicSeriesSpec {
    switch (type) {
      case 'line':
        return MockSeriesSpec.lineBase;
        break;
      case 'bar':
        return MockSeriesSpec.barBase;
        break;
      case 'area':
        return MockSeriesSpec.areaBase;
        break;
      default:
        return MockSeriesSpec.barBase;
    }
  }
}

export class MockSeriesSpecs {
  static fromSpecs(specs: BasicSeriesSpec[]): SeriesSpecs {
    const specsMap: [SpecId, BasicSeriesSpec][] = specs.map((spec) => [spec.id, spec]);
    return new Map(specsMap);
  }

  static fromPartialSpecs(specs: Partial<BasicSeriesSpec>[]): SeriesSpecs {
    const specsMap: [SpecId, BasicSeriesSpec][] = specs.map(({ seriesType, ...spec }) => {
      const base = MockSeriesSpec.byType(seriesType);
      const mergedSpec = mergePartial<BasicSeriesSpec>(base, spec, { mergeOptionalPartialValues: true });

      return [mergedSpec.id, mergedSpec];
    });
    return new Map(specsMap);
  }

  static empty(): SeriesSpecs {
    return new Map();
  }
}
