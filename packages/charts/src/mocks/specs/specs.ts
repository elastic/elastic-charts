/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../chart_types';
import { X_SCALE_DEFAULT } from '../../chart_types/heatmap/specs/scale_defaults';
import { percentFormatter } from '../../chart_types/partition_chart/layout/config';
import { PartitionLayout } from '../../chart_types/partition_chart/layout/types/config_types';
import { ShapeTreeNode } from '../../chart_types/partition_chart/layout/types/viewmodel_types';
import { AGGREGATE_KEY, PrimitiveValue } from '../../chart_types/partition_chart/layout/utils/group_by_rollup';
import { PartitionSpec } from '../../chart_types/partition_chart/specs';
import { isHorizontalRotation } from '../../chart_types/xy_chart/state/utils/common';
import {
  SeriesSpecs,
  DEFAULT_GLOBAL_ID,
  BarSeriesSpec,
  AreaSeriesSpec,
  HistogramModeAlignments,
  HistogramBarSeriesSpec,
  LineSeriesSpec,
  BasicSeriesSpec,
  SeriesType,
  BubbleSeriesSpec,
  LineAnnotationSpec,
  RectAnnotationSpec,
  AnnotationType,
  AnnotationDomainType,
  AxisSpec,
} from '../../chart_types/xy_chart/utils/specs';
import { Predicate } from '../../common/predicate';
import { ScaleType } from '../../scales/constants';
import {
  SettingsSpec,
  SpecType,
  DEFAULT_SETTINGS_SPEC,
  SmallMultiplesSpec,
  GroupBySpec,
  Spec,
  HeatmapSpec,
  TooltipSpec,
  DEFAULT_TOOLTIP_SPEC,
} from '../../specs';
import { Datum, mergePartial, Position, RecursivePartial, Rotation } from '../../utils/common';
import { LIGHT_THEME } from '../../utils/themes/light_theme';

/** @internal */
export class MockSeriesSpec {
  private static readonly barBase: BarSeriesSpec = {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    id: 'spec1',
    seriesType: SeriesType.Bar,
    groupId: DEFAULT_GLOBAL_ID,
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    hideInLegend: false,
    enableHistogramMode: false,
    data: [] as any[],
  };

  private static readonly histogramBarBase: HistogramBarSeriesSpec = {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    id: 'spec1',
    seriesType: SeriesType.Bar,
    groupId: DEFAULT_GLOBAL_ID,
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    hideInLegend: false,
    enableHistogramMode: true,
    data: [],
  };

  private static readonly areaBase: AreaSeriesSpec = {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    id: 'spec1',
    seriesType: SeriesType.Area,
    groupId: DEFAULT_GLOBAL_ID,
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    hideInLegend: false,
    histogramModeAlignment: HistogramModeAlignments.Center,
    data: [],
  };

  private static readonly lineBase: LineSeriesSpec = {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    id: 'spec1',
    seriesType: SeriesType.Line,
    groupId: DEFAULT_GLOBAL_ID,
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    hideInLegend: false,
    histogramModeAlignment: HistogramModeAlignments.Center,
    data: [],
  };

  private static readonly bubbleBase: BubbleSeriesSpec = {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    id: 'spec1',
    seriesType: SeriesType.Bubble,
    groupId: DEFAULT_GLOBAL_ID,
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    hideInLegend: false,
    data: [],
  };

  private static readonly sunburstBase: PartitionSpec = {
    chartType: ChartType.Partition,
    specType: SpecType.Series,
    id: 'spec1',
    layout: PartitionLayout.sunburst,
    valueAccessor: (d: Datum) => (typeof d === 'number' ? d : 0),
    valueGetter: (n: ShapeTreeNode): number => n[AGGREGATE_KEY],
    valueFormatter: (d: number): string => String(d),
    percentFormatter,
    topGroove: 0,
    smallMultiples: null,
    clockwiseSectors: true,
    specialFirstInnermostSector: true,
    drilldown: false,
    maxRowCount: 12,
    fillOutside: false,
    radiusOutside: 128,
    fillRectangleWidth: Infinity,
    fillRectangleHeight: Infinity,
    layers: [
      {
        groupByRollup: (d: Datum, i: number) => i,
        nodeLabel: (d: PrimitiveValue) => String(d),
        showAccessor: () => true,
        fillLabel: {},
      },
    ],
    animation: { duration: 0 },
    data: [],
  };

  private static readonly treemapBase: PartitionSpec = {
    chartType: ChartType.Partition,
    specType: SpecType.Series,
    id: 'spec1',
    layout: PartitionLayout.treemap,
    valueAccessor: (d: Datum) => (typeof d === 'number' ? d : 0),
    valueGetter: (n: ShapeTreeNode): number => n[AGGREGATE_KEY],
    valueFormatter: (d: number): string => String(d),
    percentFormatter,
    topGroove: 20,
    smallMultiples: null,
    clockwiseSectors: true,
    specialFirstInnermostSector: true,
    drilldown: false,
    maxRowCount: 12,
    fillOutside: false,
    radiusOutside: 128,
    fillRectangleWidth: Infinity,
    fillRectangleHeight: Infinity,
    layers: [
      {
        groupByRollup: (d: Datum, i: number) => i,
        nodeLabel: (d: PrimitiveValue) => String(d),
        showAccessor: () => true,
        fillLabel: {},
      },
    ],
    animation: { duration: 0 },
    data: [],
  };

  private static readonly heatmapBase: HeatmapSpec = {
    id: 'spec1',
    chartType: ChartType.Heatmap,
    specType: SpecType.Series,
    data: [],
    colorScale: {
      type: 'bands',
      bands: [
        { start: 0, end: 10, color: 'red' },
        { start: 10, end: 20, color: 'yellow' },
        { start: 20, end: 30, color: 'green' },
      ],
    },
    xAccessor: ({ x }: { x: string | number }) => x,
    yAccessor: ({ y }: { y: string | number }) => y,
    xScale: { type: X_SCALE_DEFAULT.type },
    valueAccessor: ({ value }: { value: string | number }) => value,
    valueFormatter: (value: number) => `${value}`,
    xSortPredicate: Predicate.AlphaAsc,
    ySortPredicate: Predicate.AlphaAsc,
    timeZone: 'UTC',
    xAxisTitle: '',
    yAxisTitle: '',
    xAxisLabelName: 'X Value',
    xAxisLabelFormatter: String,
    yAxisLabelName: 'Y Value',
    yAxisLabelFormatter: String,
  };

  static bar(partial?: Partial<BarSeriesSpec>): BarSeriesSpec {
    return mergePartial<BarSeriesSpec>(MockSeriesSpec.barBase, partial as RecursivePartial<BarSeriesSpec>);
  }

  static histogramBar(partial?: Partial<HistogramBarSeriesSpec>): HistogramBarSeriesSpec {
    return mergePartial<HistogramBarSeriesSpec>(
      MockSeriesSpec.histogramBarBase,
      partial as RecursivePartial<HistogramBarSeriesSpec>,
    );
  }

  static area(partial?: Partial<AreaSeriesSpec>): AreaSeriesSpec {
    return mergePartial<AreaSeriesSpec>(MockSeriesSpec.areaBase, partial as RecursivePartial<AreaSeriesSpec>);
  }

  static line(partial?: Partial<LineSeriesSpec>): LineSeriesSpec {
    return mergePartial<LineSeriesSpec>(MockSeriesSpec.lineBase, partial as RecursivePartial<LineSeriesSpec>);
  }

  static bubble(partial?: Partial<BubbleSeriesSpec>): BubbleSeriesSpec {
    return mergePartial<BubbleSeriesSpec>(MockSeriesSpec.bubbleBase, partial as RecursivePartial<BubbleSeriesSpec>);
  }

  static sunburst(partial?: Partial<PartitionSpec>): PartitionSpec {
    return mergePartial<PartitionSpec>(MockSeriesSpec.sunburstBase, partial as RecursivePartial<PartitionSpec>);
  }

  static treemap(partial?: Partial<PartitionSpec>): PartitionSpec {
    return mergePartial<PartitionSpec>(MockSeriesSpec.treemapBase, partial as RecursivePartial<PartitionSpec>);
  }

  static heatmap(partial?: Partial<HeatmapSpec>): HeatmapSpec {
    return mergePartial<HeatmapSpec>(MockSeriesSpec.heatmapBase, partial as RecursivePartial<HeatmapSpec>);
  }

  static byType(type?: SeriesType | 'histogram'): BasicSeriesSpec {
    switch (type) {
      case SeriesType.Line:
        return MockSeriesSpec.lineBase;
      case SeriesType.Area:
        return MockSeriesSpec.areaBase;
      case SeriesType.Bubble:
        return MockSeriesSpec.bubbleBase;
      case 'histogram':
        return MockSeriesSpec.histogramBarBase;
      case SeriesType.Bar:
      default:
        return MockSeriesSpec.barBase;
    }
  }

  static byTypePartial(type?: 'line' | 'bar' | 'area' | 'histogram') {
    switch (type) {
      case 'line':
        return MockSeriesSpec.line;
      case 'area':
        return MockSeriesSpec.area;
      case 'histogram':
        return MockSeriesSpec.histogramBar;
      case 'bar':
      default:
        return MockSeriesSpec.bar;
    }
  }
}

/** @internal */
export class MockSeriesSpecs {
  static fromSpecs(specs: BasicSeriesSpec[]): SeriesSpecs {
    return specs;
  }

  static fromPartialSpecs(specs: Partial<BasicSeriesSpec>[]): SeriesSpecs {
    return specs.map(({ seriesType, ...spec }) => {
      const base = MockSeriesSpec.byType(seriesType);
      return mergePartial<BasicSeriesSpec>(base, spec as RecursivePartial<BasicSeriesSpec>);
    });
  }

  static empty(): SeriesSpecs {
    return [];
  }
}

/** @internal */
export class MockGlobalSpec {
  private static readonly settingsBase: SettingsSpec = {
    ...DEFAULT_SETTINGS_SPEC,
    xDomain: { min: NaN, max: NaN },
  };

  private static readonly tooltipBase: TooltipSpec = {
    ...DEFAULT_TOOLTIP_SPEC,
  };

  private static readonly axisBase: AxisSpec = {
    id: 'yAxis',
    chartType: ChartType.XYAxis,
    specType: SpecType.Axis,
    groupId: DEFAULT_GLOBAL_ID,
    hide: false,
    showOverlappingTicks: false,
    showOverlappingLabels: false,
    position: Position.Left,
    timeAxisLayerCount: 2,
  };

  private static readonly settingsBaseNoMargings: SettingsSpec = {
    ...MockGlobalSpec.settingsBase,
    theme: {
      ...LIGHT_THEME,
      chartMargins: { top: 0, left: 0, right: 0, bottom: 0 },
      chartPaddings: { top: 0, left: 0, right: 0, bottom: 0 },
      scales: { barsPadding: 0, histogramPadding: 0 },
    },
  };

  private static readonly smallMultipleBase: SmallMultiplesSpec = {
    id: 'smallMultiple',
    chartType: ChartType.Global,
    specType: SpecType.SmallMultiples,
    style: {
      verticalPanelPadding: { outer: 0, inner: 0 },
      horizontalPanelPadding: { outer: 0, inner: 0 },
    },
  };

  private static readonly groupByBase: GroupBySpec = {
    id: 'groupBy',
    chartType: ChartType.Global,
    specType: SpecType.IndexOrder,
    by: ({ id }: Spec) => id,
    sort: Predicate.DataIndex,
  };

  static settings(partial?: RecursivePartial<SettingsSpec>): SettingsSpec {
    return mergePartial<SettingsSpec>(MockGlobalSpec.settingsBase, partial);
  }

  static settingsNoMargins(partial?: RecursivePartial<SettingsSpec>): SettingsSpec {
    return mergePartial<SettingsSpec>(MockGlobalSpec.settingsBaseNoMargings, partial);
  }

  static tooltip(partial?: RecursivePartial<TooltipSpec>): TooltipSpec {
    return mergePartial<TooltipSpec>(MockGlobalSpec.tooltipBase, partial);
  }

  static xAxis(partial?: RecursivePartial<Omit<AxisSpec, 'domain'>>, rotation: Rotation = 0): AxisSpec {
    return mergePartial<AxisSpec>(MockGlobalSpec.axisBase, partial, {}, [
      {
        id: 'xAxis',
        position: isHorizontalRotation(rotation) ? Position.Bottom : Position.Left,
      },
    ]);
  }

  static yAxis(partial?: RecursivePartial<AxisSpec>, rotation: Rotation = 0): AxisSpec {
    return mergePartial<AxisSpec>(MockGlobalSpec.axisBase, partial, {}, [
      {
        id: 'yAxis',
        position: isHorizontalRotation(rotation) ? Position.Left : Position.Bottom,
        domain: { min: NaN, max: NaN, includeDataFromIds: [] },
      },
    ]);
  }

  static smallMultiple(partial?: RecursivePartial<SmallMultiplesSpec>): SmallMultiplesSpec {
    return mergePartial<SmallMultiplesSpec>(MockGlobalSpec.smallMultipleBase, partial);
  }

  static groupBy(partial?: RecursivePartial<GroupBySpec>): GroupBySpec {
    return mergePartial<GroupBySpec>(MockGlobalSpec.groupByBase, partial);
  }
}

/** @internal */
export class MockAnnotationSpec {
  private static readonly lineBase: LineAnnotationSpec = {
    id: 'line_annotation_1',
    groupId: DEFAULT_GLOBAL_ID,
    chartType: ChartType.XYAxis,
    specType: SpecType.Annotation,
    annotationType: AnnotationType.Line,
    dataValues: [],
    domainType: AnnotationDomainType.XDomain,
  };

  private static readonly rectBase: RectAnnotationSpec = {
    id: 'rect_annotation_1',
    groupId: DEFAULT_GLOBAL_ID,
    chartType: ChartType.XYAxis,
    specType: SpecType.Annotation,
    annotationType: AnnotationType.Rectangle,
    dataValues: [],
  };

  static line(partial?: Partial<LineAnnotationSpec>): LineAnnotationSpec {
    // @ts-ignore - nesting limitation
    return mergePartial<LineAnnotationSpec>(MockAnnotationSpec.lineBase, partial);
  }

  static rect(partial?: Partial<RectAnnotationSpec>): RectAnnotationSpec {
    return mergePartial<RectAnnotationSpec>(MockAnnotationSpec.rectBase, partial);
  }
}
