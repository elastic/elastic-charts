/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type {
  Settings,
  GroupBy,
  SmallMultiples,
  Axis,
  LineSeries,
  AreaSeries,
  BarSeries,
  BubbleSeries,
  HistogramBarSeries,
  LineAnnotation,
  RectAnnotation,
  /* Standalone specs */
  Goal,
  Heatmap,
  Metric,
  Partition,
  Wordcloud,
} from './index';

/**
 * Permitted specs to be used as children in Chart component
 * @public
 */
export type PermittedSpecs =
  /* Global specs */
  | typeof Settings
  | typeof GroupBy
  | typeof SmallMultiples
  /* XY specs */
  | typeof Axis
  | typeof LineSeries
  | typeof AreaSeries
  | typeof BarSeries
  | typeof BubbleSeries
  | typeof HistogramBarSeries
  | typeof LineAnnotation
  | typeof RectAnnotation
  /* Standalone specs */
  | typeof Goal
  | typeof Heatmap
  | typeof Metric
  | typeof Partition
  | typeof Wordcloud;
