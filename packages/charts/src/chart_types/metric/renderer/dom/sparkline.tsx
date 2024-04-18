/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FunctionComponent } from 'react';

import { colorToHsl, hslToColor } from '../../../../common/color_library_wrappers';
import { extent } from '../../../../common/math';
import { areaGenerator } from '../../../../geoms/path';
import { isFiniteNumber } from '../../../../utils/common';
import { CurveType } from '../../../../utils/curves';
import { MetricTrendShape, MetricWTrend } from '../../specs';

/** @internal */
export const getSparkLineColor = (color: MetricWTrend['color']) => {
  const [h, s, l, a] = colorToHsl(color);
  return hslToColor(h, s, l >= 0.8 ? l - 0.1 : l + 0.1, a);
};

// Sometimes the trend data arrives with multiple series
// appended one on top of each other. This function makes
/**
 * sure to realign all the histograms and implicitly stack them
 * @internal
 */
export const getSafeTrendData = (trend: MetricWTrend['trend']) => {
  let lastX = trend[0]?.x;
  // Skip all the work asap if trend is already sorted
  const shouldBeSorted =
    // eslint-disable-next-line eqeqeq
    lastX != null &&
    trend.some(({ x }) => {
      // eslint-disable-next-line eqeqeq
      if (lastX == null) {
        return false;
      }
      if (lastX > x) {
        return true;
      }
      lastX = x;
    });
  if (!shouldBeSorted) {
    return trend;
  }
  // Group by x and sum all the y values
  return Object.entries(
    trend.reduce(
      (memo, { x, y }) => {
        // eslint-disable-next-line eqeqeq
        if (memo[x] == null) {
          memo[x] = 0;
        }
        // eslint-disable-next-line eqeqeq
        if (y != null) {
          memo[x] += y;
        }
        return memo;
      },
      {} as Record<number, number>,
    ),
  )
    .map(([x, y]) => ({ x: Number(x), y }))
    .sort((a, b) => a.x - b.x);
};

/** @internal */
export const SparkLine: FunctionComponent<{
  id: string;
  datum: MetricWTrend;
}> = ({ id, datum: { color, trend, trendA11yTitle, trendA11yDescription, trendShape } }) => {
  if (!trend) {
    return null;
  }
  const groupedTrendData = getSafeTrendData(trend);
  const [xMin, xMax] = extent(groupedTrendData.map((d) => d.x));
  const [, yMax] = extent(groupedTrendData.map((d) => d.y));
  const xScale = (value: number) => (value - xMin) / (xMax - xMin);
  const yScale = (value: number) => value / yMax;

  const path = areaGenerator<{ x: number; y: number }>(
    (d) => xScale(d.x),
    () => 1,
    (d) => 1 - yScale(d.y),
    (d) => isFiniteNumber(d.x) && isFiniteNumber(d.y),
    trendShape === MetricTrendShape.Bars ? CurveType.CURVE_STEP_AFTER : CurveType.LINEAR,
  );

  const titleId = `${id}-trend-title`;
  const descriptionId = `${id}-trend-description`;
  return (
    <div className="echSingleMetricSparkline">
      <svg
        className="echSingleMetricSparkline__svg"
        width="100%"
        height="100%"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId} className="echScreenReaderOnly">
          {trendA11yTitle}
        </title>
        <text id={descriptionId} className="echScreenReaderOnly" fontSize={0}>
          {trendA11yDescription}
        </text>

        <rect x={0} y={0} width={1} height={1} fill={color} />

        <path
          d={path.area(groupedTrendData)}
          transform="translate(0, 0.5),scale(1,0.5)"
          fill={getSparkLineColor(color)}
          stroke="none"
          strokeWidth={0}
        />
      </svg>
    </div>
  );
};
