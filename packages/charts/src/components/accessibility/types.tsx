/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { GoalChartData } from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';
import type { A11ySettings } from '../../state/selectors/get_accessibility_config';

interface ScreenReaderTypesProps {
  chartTypeDescription: string;
  goalChartData?: GoalChartData;
}

/** @internal */
export function ScreenReaderTypes({
  goalChartData,
  defaultSummaryId,
  chartTypeDescription,
}: A11ySettings & ScreenReaderTypesProps) {
  if (!defaultSummaryId && !goalChartData) return null;
  const validGoalChart =
    chartTypeDescription === 'goal chart' ||
    chartTypeDescription === 'horizontalBullet chart' ||
    chartTypeDescription === 'verticalBullet chart';
  return (
    <dl>
      <dt>Chart type:</dt>
      <dd id={defaultSummaryId}>{chartTypeDescription}</dd>
      {validGoalChart && goalChartData && !isNaN(goalChartData.maximum) ? (
        <>
          <dt>Minimum:</dt>
          <dd>{goalChartData.minimum}</dd>
          <dt>Maximum:</dt>
          <dd>{goalChartData.maximum}</dd>
          <dt>Target:</dt>
          <dd>{goalChartData.target}</dd>
          <dd>Value:</dd>
          <dt>{goalChartData.value}</dt>
        </>
      ) : null}
    </dl>
  );
}
