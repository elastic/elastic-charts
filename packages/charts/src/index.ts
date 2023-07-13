/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export * from './components';
export { ChartType } from './chart_types';
export { ChartSize, ChartSizeArray, ChartSizeObject } from './utils/chart_size';

export { SpecId, GroupId, AxisId, AnnotationId } from './utils/ids';

// Everything related to the specs types and react-components
export * from './specs';
export {
  DebugState,
  DebugStateLine,
  DebugStateValue,
  DebugStateAnnotations,
  DebugStateArea,
  DebugStateAxes,
  DebugStateBar,
  DebugStateLegend,
  DebugStateLineConfig,
  DebugStateAxis,
  DebugStateBase,
  DebugStateLegendItem,
  PointerValue,
} from './state/types';
export { toEntries } from './utils/common';
export { CurveType } from './utils/curves';
export { ContinuousDomain, OrdinalDomain } from './utils/domain';
export { Dimensions, SimplePadding, Padding, PerSideDistance, Margins } from './utils/dimensions';
export { timeFormatter, niceTimeFormatter, niceTimeFormatByDay } from './utils/data/formatters';
export { SeriesCompareFn } from './utils/series_sort';
export { SeriesIdentifier, SeriesKey } from './common/series_id';
export { XYChartSeriesIdentifier, DataSeriesDatum, FilledValues } from './chart_types/xy_chart/utils/series';
export {
  AnnotationTooltipFormatter,
  CustomAnnotationTooltip,
  ComponentWithAnnotationDatum,
} from './chart_types/xy_chart/annotations/types';
export { GeometryValue, BandedAccessorType } from './utils/geometry';
export { LegendPath, LegendPathElement } from './state/actions/legend';
export { CategoryKey, CategoryLabel } from './common/category';
export { Layer as PartitionLayer, PartitionProps } from './chart_types/partition_chart/specs/index';
export { FillLabelConfig as PartitionFillLabel, PartitionStyle } from './utils/themes/partition';
export { PartitionLayout } from './chart_types/partition_chart/layout/types/config_types';

export {
  Accessor,
  AccessorFn,
  IndexedAccessorFn,
  UnaryAccessorFn,
  AccessorObjectKey,
  AccessorArrayIndex,
} from './utils/accessor';
export * from './components/tooltip';

// scales
export { ScaleType } from './scales/constants';
export { ScaleContinuousType, ScaleOrdinalType, ScaleBandType, LogScaleOptions } from './scales';

// TODO move animation to its own package
export {
  AnimationOptions,
  AnimatedValue,
  AnimationSpeed,
} from './chart_types/xy_chart/renderer/canvas/animations/animation';

// theme
export * from './utils/themes/theme';
export * from './utils/themes/theme_common';
export { LIGHT_THEME } from './utils/themes/light_theme';
export { DARK_THEME } from './utils/themes/dark_theme';

// wordcloud
export { WordcloudViewModel } from './chart_types/wordcloud/layout/types/viewmodel_types';

// partition
export * from './chart_types/partition_chart/layout/types/viewmodel_types';
export * from './chart_types/partition_chart/layout/utils/group_by_rollup';
export { AnimKeyframe } from './chart_types/partition_chart/layout/types/config_types';

// heatmap
export { Cell } from './chart_types/heatmap/layout/types/viewmodel_types';
export { HeatmapCellDatum } from './chart_types/heatmap/layout/viewmodel/viewmodel';
export {
  ColorBand,
  HeatmapBandsColorScale,
  HeatmapProps,
  HeatmapHighlightedData,
} from './chart_types/heatmap/specs/heatmap';

// utilities
export {
  Datum,
  Position,
  Rendering,
  Rotation,
  VerticalAlignment,
  HorizontalAlignment,
  RecursivePartial,
  NonAny,
  IsAny,
  IsUnknown,
  ColorVariant,
  LabelAccessor,
  ShowAccessor,
  ValueAccessor,
  ValueFormatter,
  LayoutDirection,
} from './utils/common';
export { DataGenerator } from './utils/data_generators/data_generator';
export * from './utils/themes/merge_utils';
export * from './utils/use_legend_action';
export { MODEL_KEY, defaultPartitionValueFormatter } from './chart_types/partition_chart/layout/config';
export { LegendStrategy } from './chart_types/partition_chart/layout/utils/highlighted_geoms';
export { Pixels, Ratio, TimeMs } from './common/geometry';
export { AdditiveNumber } from './utils/accessor';
export { FontStyle, FONT_STYLES } from './common/text_utils';
export { Color } from './common/colors';
export { RGB, A, RgbaTuple } from './common/color_library_wrappers';
export { Predicate } from './common/predicate';
export { SmallMultiplesDatum } from './common/panel_utils';

export type {
  ESCalendarInterval,
  ESCalendarIntervalUnit,
  ESFixedInterval,
  ESFixedIntervalUnit,
} from './utils/chrono/elasticsearch';
export type { UnixTimestamp } from './utils/chrono/types';
export { roundDateToESInterval } from './utils/chrono/elasticsearch';

// data utils
export { GroupKeysOrKeyFn, GroupByKeyFn } from './chart_types/xy_chart/utils/group_data_series';
export { computeRatioByGroups } from './utils/data/data_processing';
export { TimeFunction } from './utils/time_functions';
export * from './chart_types/flame_chart/flame_api';
export * from './chart_types/timeslip/timeslip_api';
export { LegacyAnimationConfig } from './common/animation';
