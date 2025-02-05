/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

/**
 * Available chart types
 * @public
 */
export const ChartType = Object.freeze({
  Global: 'global' as const,
  Goal: 'goal' as const,
  Partition: 'partition' as const,
  Flame: 'flame' as const,
  Timeslip: 'timeslip' as const,
  XYAxis: 'xy_axis' as const,
  Heatmap: 'heatmap' as const,
  Wordcloud: 'wordcloud' as const,
  Metric: 'metric' as const,
  Bullet: 'bullet' as const,
});
/** @public */
export type ChartType = $Values<typeof ChartType>;
