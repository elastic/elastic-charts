/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export * from './components';
export type { ChartType } from './chart_types';
export type { ChartSize, ChartSizeArray, ChartSizeObject } from './utils/chart_size';

export type { SpecId, GroupId, AxisId, AnnotationId } from './utils/ids';

// Everything related to the specs types and react-components
export * from './specs';
export * from './specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
export type {
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
  BulletDebugState,
  BulletDebugStateRow,
  PointerValue,
} from './state/types';
export { toEntries } from './utils/common';
export type { CurveType } from './utils/curves';
export type { ContinuousDomain, OrdinalDomain, GenericDomain, Range } from './utils/domain';
export type { Dimensions, SimplePadding, Padding, PerSideDistance, Margins } from './utils/dimensions';
export { timeFormatter, niceTimeFormatter, niceTimeFormatByDay } from './utils/data/formatters';
export type { SeriesCompareFn } from './utils/series_sort';
export type { SeriesIdentifier, SeriesKey } from './common/series_id';
export type { XYChartSeriesIdentifier, DataSeriesDatum, FilledValues } from './chart_types/xy_chart/utils/series';
export type {
  AnnotationTooltipFormatter,
  CustomAnnotationTooltip,
  ComponentWithAnnotationDatum,
} from './chart_types/xy_chart/annotations/types';
export type { GeometryValue, BandedAccessorType } from './utils/geometry';
export type { LegendPath, LegendPathElement } from './state/actions/legend';
export type { LegendItemValue, LegendValue } from './common/legend';
export type { CategoryKey, CategoryLabel } from './common/category';
export type { Layer as PartitionLayer, PartitionProps } from './chart_types/partition_chart/specs/index';
export type { FillLabelConfig as PartitionFillLabel, PartitionStyle } from './utils/themes/partition';
export type { PartitionLayout } from './chart_types/partition_chart/layout/types/config_types';

export type {
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
export type { ScaleContinuousType, ScaleOrdinalType, ScaleBandType, LogScaleOptions } from './scales';

// TODO move animation to its own package
export type {
  AnimationOptions,
  AnimatedValue,
  AnimationSpeed,
} from './chart_types/xy_chart/renderer/canvas/animations/animation';

// theme
export * from './utils/themes/theme';
export * from './utils/themes/theme_common';
export { getChartsTheme } from './utils/themes/get_charts_theme';
export { LIGHT_THEME } from './utils/themes/light_theme';
export { DARK_THEME } from './utils/themes/dark_theme';
export { LEGACY_LIGHT_THEME } from './utils/themes/legacy_light_theme';
export { LEGACY_DARK_THEME } from './utils/themes/legacy_dark_theme';
export { AMSTERDAM_LIGHT_THEME } from './utils/themes/amsterdam_light_theme';
export { AMSTERDAM_DARK_THEME } from './utils/themes/amsterdam_dark_theme';

// wordcloud
export type { WordcloudViewModel } from './chart_types/wordcloud/layout/types/viewmodel_types';

// partition
export * from './chart_types/partition_chart/layout/types/viewmodel_types';
export * from './chart_types/partition_chart/layout/utils/group_by_rollup';
export type { AnimKeyframe } from './chart_types/partition_chart/layout/types/config_types';

// heatmap
export type { Cell } from './chart_types/heatmap/layout/types/viewmodel_types';
export type { HeatmapCellDatum } from './chart_types/heatmap/layout/viewmodel/viewmodel';
export type {
  ColorBand,
  HeatmapBandsColorScale,
  HeatmapProps,
  HeatmapHighlightedData,
} from './chart_types/heatmap/specs/heatmap';

// utilities
export type {
  Datum,
  Rendering,
  Rotation,
  RecursivePartial,
  NonAny,
  IsAny,
  IsUnknown,
  LabelAccessor,
  ShowAccessor,
  ValueAccessor,
  ValueFormatter,
} from './utils/common';
export { Position, VerticalAlignment, HorizontalAlignment, ColorVariant, LayoutDirection } from './utils/common';
export { DataGenerator } from './utils/data_generators/data_generator';
export * from './utils/themes/merge_utils';
export * from './utils/use_legend_action';
export { MODEL_KEY, defaultPartitionValueFormatter } from './chart_types/partition_chart/layout/config';
export type { LegendStrategy } from './chart_types/partition_chart/layout/utils/highlighted_geoms';
export type { Pixels, Ratio, TimeMs } from './common/geometry';
export type { AdditiveNumber } from './utils/accessor';
export type { FontStyle, FONT_STYLES } from './common/text_utils';
export type { Color } from './common/colors';
export type { RGB, A, RgbaTuple } from './common/color_library_wrappers';
export type { Predicate } from './common/predicate';
export type { SmallMultiplesDatum } from './common/panel_utils';

export type {
  ESCalendarInterval,
  ESCalendarIntervalUnit,
  ESFixedInterval,
  ESFixedIntervalUnit,
} from './utils/chrono/elasticsearch';
export type { UnixTimestamp } from './utils/chrono/types';
export { roundDateToESInterval } from './utils/chrono/elasticsearch';

// data utils
export type { GroupKeysOrKeyFn, GroupByKeyFn } from './chart_types/xy_chart/utils/group_data_series';
export { computeRatioByGroups } from './utils/data/data_processing';
export type { TimeFunction } from './utils/time_functions';
export * from './chart_types/flame_chart/flame_api';
export * from './chart_types/timeslip/timeslip_api';
export type { LegacyAnimationConfig } from './common/animation';

// Bullet
export type {
  ColorBandValue,
  ColorBandConfig,
  ColorBandSimpleConfig,
  ColorBandComplexConfig,
  BulletColorConfig,
} from './chart_types/bullet_graph/utils/color';
