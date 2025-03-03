/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { chartSelectorsFactory as bulletSelectorsFactory } from './bullet_graph/chart_state';
import { chartSelectorsFactory as flameSelectorsFactory } from './flame_chart/chart_state';
import { chartSelectorsFactory as goalSelectorsFactory } from './goal_chart/state/chart_state';
import { chartSelectorsFactory as heatmapSelectorsFactory } from './heatmap/state/chart_state';
import { ChartType } from './index';
import { chartSelectorsFactory as metricSelectorsFactory } from './metric/state/chart_state';
import { chartSelectorsFactory as partitionSelectorsFactory } from './partition_chart/state/chart_state';
import { chartSelectorsFactory as timeslipSelectorsFactory } from './timeslip/chart_state';
import { chartSelectorsFactory as wordcloudSelectorsFactory } from './wordcloud/state/chart_state';
import { chartSelectorsFactory as xyAxisChartSelectorsFactory } from './xy_chart/state/chart_state';
import type { ChartSelectors } from '../state/chart_selectors';

/** @internal */
export const chartTypeSelectors: Record<ChartType, () => ChartSelectors | null> = {
  [ChartType.Goal]: goalSelectorsFactory,
  [ChartType.Partition]: partitionSelectorsFactory,
  [ChartType.Flame]: flameSelectorsFactory,
  [ChartType.Timeslip]: timeslipSelectorsFactory,
  [ChartType.XYAxis]: xyAxisChartSelectorsFactory,
  [ChartType.Heatmap]: heatmapSelectorsFactory,
  [ChartType.Wordcloud]: wordcloudSelectorsFactory,
  [ChartType.Metric]: metricSelectorsFactory,
  [ChartType.Bullet]: bulletSelectorsFactory,
  [ChartType.Global]: () => null,
}; // with no default, TS signals if a new chart type isn't added here too
