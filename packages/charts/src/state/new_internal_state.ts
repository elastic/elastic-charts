/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { InternalChartState } from './internal_chart_state';
import { BulletState } from '../chart_types/bullet_graph/chart_state';
import { ChartType } from '../chart_types';
import { FlameState } from '../chart_types/flame_chart/internal_chart_state';
import { GoalState } from '../chart_types/goal_chart/state/chart_state';
import { HeatmapState } from '../chart_types/heatmap/state/chart_state';
import { MetricState } from '../chart_types/metric/state/chart_state';
import { PartitionState } from '../chart_types/partition_chart/state/chart_state';
import { TimeslipState } from '../chart_types/timeslip/internal_chart_state';
import { WordcloudState } from '../chart_types/wordcloud/state/chart_state';
import { XYAxisChartState } from '../chart_types/xy_chart/state/chart_state';

const constructors: Record<ChartType, () => InternalChartState | null> = {
  [ChartType.Goal]: () => new GoalState(),
  [ChartType.Partition]: () => new PartitionState(),
  [ChartType.Flame]: () => new FlameState(),
  [ChartType.Timeslip]: () => new TimeslipState(),
  [ChartType.XYAxis]: () => new XYAxisChartState(),
  [ChartType.Heatmap]: () => new HeatmapState(),
  [ChartType.Wordcloud]: () => new WordcloudState(),
  [ChartType.Metric]: () => new MetricState(),
  [ChartType.Bullet]: () => new BulletState(),
  [ChartType.Global]: () => null,
}; // with no default, TS signals if a new chart type isn't added here too

/** @internal */
export function newInternalState(chartType: ChartType | null): InternalChartState | null {
  return chartType ? constructors[chartType]() : null;
}
