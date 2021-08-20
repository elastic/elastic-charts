/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export * from './components';
export { ChartType } from './chart_types';
export type { ChartSize, ChartSizeArray, ChartSizeObject } from './utils/chart_size';

export type { SpecId, GroupId, AxisId, AnnotationId } from './utils/ids';

// Everything related to the specs types and react-components
export * from './specs';
export type { DebugState } from './state/types';
export { toEntries } from './utils/common';
export { CurveType } from './utils/curves';
export type { ContinuousDomain, OrdinalDomain } from './utils/domain';
export type { SimplePadding, Padding } from './utils/dimensions';
export { timeFormatter, niceTimeFormatter, niceTimeFormatByDay } from './utils/data/formatters';
export type { SeriesIdentifier, SeriesKey } from './common/series_id';
export type { XYChartSeriesIdentifier, DataSeriesDatum, FilledValues } from './chart_types/xy_chart/utils/series';
export type {
  AnnotationTooltipFormatter,
  CustomAnnotationTooltip,
  ComponentWithAnnotationDatum,
} from './chart_types/xy_chart/annotations/types';
export type { GeometryValue, BandedAccessorType } from './utils/geometry';
export type { LegendPath, LegendPathElement } from './state/actions/legend';
export type { CategoryKey } from './common/category';
export type {
  Config as PartitionConfig,
  FillLabelConfig as PartitionFillLabel,
  PartitionLayout,
} from './chart_types/partition_chart/layout/types/config_types';
export type { Layer as PartitionLayer } from './chart_types/partition_chart/specs/index';
// export * from './chart_types/goal_chart/specs/index';
// export * from './chart_types/wordcloud/specs/index';

export type {
  Accessor,
  AccessorFn,
  IndexedAccessorFn,
  UnaryAccessorFn,
  AccessorObjectKey,
  AccessorArrayIndex,
} from './utils/accessor';
export type { CustomTooltip, TooltipInfo } from './components/tooltip/types';

// scales
export { ScaleType } from './scales/constants';
export type { ScaleContinuousType, ScaleOrdinalType, ScaleBandType, LogBase, LogScaleOptions } from './scales';

// theme
export * from './utils/themes/theme';
export * from './utils/themes/theme_common';
export { LIGHT_THEME } from './utils/themes/light_theme';
export { DARK_THEME } from './utils/themes/dark_theme';

// partition
export * from './chart_types/partition_chart/layout/types/viewmodel_types';
export * from './chart_types/partition_chart/layout/utils/group_by_rollup';

// heatmap
export type { Cell } from './chart_types/heatmap/layout/types/viewmodel_types';
export type { Config as HeatmapConfig, HeatmapBrushEvent } from './chart_types/heatmap/layout/types/config_types';
export type { ColorBand, HeatmapBandsColorScale } from './chart_types/heatmap/specs/heatmap';

// utilities
export { Position } from './utils/common';
export type {
  Datum,
  Rendering,
  Rotation,
  VerticalAlignment,
  HorizontalAlignment,
  RecursivePartial,
  NonAny,
  IsAny,
  IsUnknown,
  ColorVariant,
  Color,
  LabelAccessor,
  ShowAccessor,
  ValueAccessor,
  ValueFormatter,
  LayoutDirection,
} from './utils/common';
export { DataGenerator } from './utils/data_generators/data_generator';
export * from './utils/themes/merge_utils';
export { MODEL_KEY } from './chart_types/partition_chart/layout/config';
export { LegendStrategy } from './chart_types/partition_chart/layout/utils/highlighted_geoms';
export type { Ratio } from './common/geometry';
export type { AdditiveNumber } from './utils/accessor';
export type { FontStyle } from './common/text_utils';
export { FONT_STYLES } from './common/text_utils';
