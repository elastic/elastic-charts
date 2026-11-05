/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export {
  AreaSeries,
  type AreaSeriesProps,
  Axis,
  type AxisProps,
  BarSeries,
  type BarSeriesProps,
  BubbleSeries,
  type BubbleSeriesProps,
  HistogramBarSeries,
  type HistogramBarSeriesProps,
  LineAnnotation,
  type LineAnnotationProps,
  LineSeries,
  type LineSeriesProps,
  RectAnnotation,
  type RectAnnotationProps,
} from './xy_chart/specs';

export * from './xy_chart/utils/specs';

export * from './wordcloud/specs';

export * from './goal_chart/specs';

export { Partition } from './partition_chart/specs';

export {
  Heatmap,
  type HeatmapSpec,
  type RasterTimeScale,
  type TimeScale,
  type LinearScale,
  type OrdinalScale,
} from './heatmap/specs';

export {
  Metric,
  MetricTrendShape,
  type MetricSpecProps,
  type MetricSpec,
  type MetricBase,
  type MetricWText,
  type MetricWNumber,
  type MetricWNumberArrayValues,
  type MetricWStringArrayValues,
  type MetricWProgress,
  type MetricProgressValueLabels,
  type MetricWTrend,
  type MetricDatum,
  type SecondaryMetricProps,
  type SecondaryMetricLabelTooltipProps,
} from './metric/specs';

export {
  Bullet,
  type BulletProps,
  type BulletSpec,
  type BulletDatum,
  BulletSubtype,
  type BulletValueLabels,
} from './bullet_graph/spec';
export type { BulletStyle } from './bullet_graph/theme';
