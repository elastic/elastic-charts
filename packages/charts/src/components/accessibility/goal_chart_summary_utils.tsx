/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { GoalChartData } from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';

export function createGoalChartDescription(
  chartTypeDescription: string,
  goalChartData?: GoalChartData,
): string | null {
  const validGoalChart =
    chartTypeDescription === 'goal chart' ||
    chartTypeDescription === 'horizontalBullet chart' ||
    chartTypeDescription === 'verticalBullet chart';

  if (!validGoalChart || !goalChartData || isNaN(goalChartData.maximum)) {
    return null;
  }

  return `Minimum: ${goalChartData.minimum}, Maximum: ${goalChartData.maximum}, Target: ${goalChartData.target}, Value: ${goalChartData.value}`;
}