/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { GoalChartData } from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';
import type { BasicSeriesSpec } from '../../chart_types/xy_chart/utils/specs';
import type { A11ySettings } from '../../state/selectors/get_accessibility_config';

interface ScreenReaderTypesProps {
  chartTypeDescription: string;
  goalChartData?: GoalChartData;
  seriesSpecs?: BasicSeriesSpec[];
}

/** @internal */
export function ScreenReaderTypes({
  goalChartData,
  defaultSummaryId,
  chartTypeDescription,
  seriesSpecs,
}: A11ySettings & ScreenReaderTypesProps) {
  if (!defaultSummaryId && !goalChartData) return null;
  const validGoalChart =
    chartTypeDescription === 'goal chart' ||
    chartTypeDescription === 'horizontalBullet chart' ||
    chartTypeDescription === 'verticalBullet chart';

  // Enhanced chart type description with series count and names
  const getEnhancedChartDescription = () => {
    if (validGoalChart || !seriesSpecs || seriesSpecs.length === 0) {
      return chartTypeDescription;
    }

    const seriesTypes = new Set<string>();
    seriesSpecs.forEach((spec) => seriesTypes.add(spec.seriesType));

    // Get series names for breakdown
    const seriesNames = seriesSpecs
      .map((spec) => {
        if (typeof spec.name === 'string') return spec.name;
        if (typeof spec.name === 'object' && spec.name?.names) return 'Series'; // Complex naming object, fallback to generic
        // For function names, we can't easily call them without XYChartSeriesIdentifier
        // so we'll use the spec ID as fallback
        return `Series ${spec.id}`;
      })
      .filter((name) => name);

    // Create enhanced description
    if (seriesTypes.size === 1) {
      const seriesType = Array.from(seriesTypes)[0];
      const count = seriesSpecs.length;

      if (count === 1) {
        return `${seriesType} chart`;
      } else {
        const description = `${seriesType} chart with ${count} ${seriesType}s`;
        if (seriesNames.length > 0 && seriesNames.length <= 5) {
          // Include series names if reasonable number (max 5 to avoid too long descriptions)
          return `${description}: ${seriesNames.join(', ')}`;
        }
        return description;
      }
    } else {
      // Mixed chart types
      return `Mixed chart: ${Array.from(seriesTypes).join(' and ')} chart`;
    }
  };

  const enhancedDescription = getEnhancedChartDescription();

  return (
    <>
      <div>{enhancedDescription}</div>
      {validGoalChart && goalChartData && !isNaN(goalChartData.maximum) ? (
        <dl>
          <dt>Minimum:</dt>
          <dd>{goalChartData.minimum}</dd>
          <dt>Maximum:</dt>
          <dd>{goalChartData.maximum}</dd>
          <dt>Target:</dt>
          <dd>{goalChartData.target}</dd>
          <dd>Value:</dd>
          <dt>{goalChartData.value}</dt>
        </dl>
      ) : null}
    </>
  );
}
