/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../chart_types';
import { chartSelectorsFactory as bulletSelectorsFactory } from '../../chart_types/bullet_graph/chart_state';
import { chartSelectorsFactory as flameSelectorsFactory } from '../../chart_types/flame_chart/internal_chart_state';
import { chartSelectorsFactory as goalSelectorsFactory } from '../../chart_types/goal_chart/state/chart_state';
import { chartSelectorsFactory as heatmapSelectorsFactory } from '../../chart_types/heatmap/state/chart_state';
import { chartSelectorsFactory as metricSelectorsFactory } from '../../chart_types/metric/state/chart_state';
import { chartSelectorsFactory as partitionSelectorsFactory } from '../../chart_types/partition_chart/state/chart_state';
import { chartSelectorsFactory as timeslipSelectorsFactory } from '../../chart_types/timeslip/internal_chart_state';
import { chartSelectorsFactory as wordcloudSelectorsFactory } from '../../chart_types/wordcloud/state/chart_state';
import { chartSelectorsFactory as xyAxisChartSelectorsFactory } from '../../chart_types/xy_chart/state/chart_state';
import type { ChartSelectors } from '../chart_selectors';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

const constructors: Record<ChartType, () => ChartSelectors | null> = {
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

/**
 * @internal
 */
export const getInternalChartStateSelector = createCustomCachedSelector(
  [(state: GlobalChartState) => state.chartType],
  (chartType): ChartSelectors | null => (chartType ? constructors[chartType]() : null),
);
