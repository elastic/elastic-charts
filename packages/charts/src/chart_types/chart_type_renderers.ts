/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { chartRenderer as bulletRenderer } from './bullet_graph/chart_renderer';
import { FlameWithTooltip as flameRenderer } from './flame_chart/flame_chart';
import { chartRenderer as goalRenderer } from './goal_chart/state/chart_renderer';
import { chartRenderer as heatmapRenderer } from './heatmap/state/chart_renderer';
import { ChartType } from './index';
import { chartRenderer as metricRenderer } from './metric/state/chart_renderer';
import { chartRenderer as partitionRenderer } from './partition_chart/renderer/dom/layered_partition_chart';
import { chartRenderer as timeslipRenderer } from './timeslip/timeslip_chart';
import { chartRenderer as wordcloudRenderer } from './wordcloud/state/chart_renderer';
import { chartRenderer as xyAxisChartRenderer } from './xy_chart/state/chart_renderer';
import type { ChartRenderer } from '../state/internal_chart_renderer';

/** @internal */
export const chartTypeRenderer: Record<ChartType, () => ChartRenderer | null> = {
  [ChartType.Goal]: () => goalRenderer,
  [ChartType.Partition]: () => partitionRenderer,
  [ChartType.Flame]: () => flameRenderer,
  [ChartType.Timeslip]: () => timeslipRenderer,
  [ChartType.XYAxis]: () => xyAxisChartRenderer,
  [ChartType.Heatmap]: () => heatmapRenderer,
  [ChartType.Wordcloud]: () => wordcloudRenderer,
  [ChartType.Metric]: () => metricRenderer,
  [ChartType.Bullet]: () => bulletRenderer,
  [ChartType.Global]: () => null,
}; // with no default, TS signals if a new chart type isn't added here too
