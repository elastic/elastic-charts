/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../chart_types';
import { chartRenderer as bulletRenderer } from '../../chart_types/bullet_graph/chart_renderer';
import { FlameWithTooltip as flameRenderer } from '../../chart_types/flame_chart/flame_chart';
import { chartRenderer as goalRenderer } from '../../chart_types/goal_chart/state/chart_renderer';
import { chartRenderer as heatmapRenderer } from '../../chart_types/heatmap/state/chart_renderer';
import { chartRenderer as metricRenderer } from '../../chart_types/metric/state/chart_renderer';
import { chartRenderer as partitionRenderer } from '../../chart_types/partition_chart/renderer/dom/layered_partition_chart';
import { chartRenderer as timeslipRenderer } from '../../chart_types/timeslip/timeslip_chart';
import { chartRenderer as wordcloudRenderer } from '../../chart_types/wordcloud/state/chart_renderer';
import { chartRenderer as xyAxisChartRenderer } from '../../chart_types/xy_chart/state/chart_renderer';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';
import type { ChartRenderer } from '../internal_chart_renderer';

const constructors: Record<ChartType, () => ChartRenderer | null> = {
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

/**
 * @internal
 */
export const getInternalChartRendererSelector = createCustomCachedSelector(
  [(state: GlobalChartState) => state.chartType],
  (chartType): ChartRenderer | null => (chartType ? constructors[chartType]() : null),
);
