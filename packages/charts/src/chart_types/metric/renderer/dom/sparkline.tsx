/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { FunctionComponent } from 'react';
import React from 'react';

import { colorToHsl, hslToColor } from '../../../../common/color_library_wrappers';
import { extent } from '../../../../common/math';
import { areaGenerator } from '../../../../geoms/path';
import { isFiniteNumber } from '../../../../utils/common';
import { CurveType } from '../../../../utils/curves';
import type { MetricWTrend } from '../../specs';
import { MetricTrendShape } from '../../specs';

/** @internal */
export const getSparkLineColor = (color: MetricWTrend['color']) => {
  const [h, s, l, a] = colorToHsl(color);
  return hslToColor(h, s, l >= 0.8 ? l - 0.1 : l + 0.1, a);
};

/**
 * Aligns and implicitly stacks all histogram trend data.
 *
 * Sometimes the trend data arrives with multiple series
 * appended one on top of each other.
 *
 * @internal
 */
export const getSortedData = (trend: MetricWTrend['trend']) => {
  const shouldBeSorted = trend.some(({ x }, i) => {
    if (i === 0) {
      return false;
    }
    const prevItem = trend[i - 1];
    return Boolean(prevItem ? x < prevItem.x : true);
  });
  if (!shouldBeSorted) {
    return trend;
  }
  return trend.slice().sort((a, b) => {
    return a.x - b.x || +a.y - b.y;
  });
};

/** @internal */
export const SparkLine: FunctionComponent<{
  id: string;
  datum: MetricWTrend;
}> = ({ id, datum: { color, trend, trendA11yTitle, trendA11yDescription, trendShape } }) => {
  const sortedTrendData = getSortedData(trend);
  const xMin = sortedTrendData.at(0)?.x ?? NaN;
  const xMax = sortedTrendData.at(-1)?.x ?? NaN;
  const [, yMax] = extent(sortedTrendData.map((d) => d.y));
  const xScale = (value: number) => (value - xMin) / (xMax - xMin);
  const yScale = (value: number) => value / yMax;

  const shouldVisualizePath = Boolean(xMax - xMin) && yMax;

  const path = shouldVisualizePath
    ? areaGenerator<{ x: number; y: number }>(
        (d) => xScale(d.x),
        () => 1,
        (d) => 1 - yScale(d.y),
        (d) => isFiniteNumber(d.x) && isFiniteNumber(d.y),
        trendShape === MetricTrendShape.Bars ? CurveType.CURVE_STEP_AFTER : CurveType.LINEAR,
      )
    : undefined;

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
        aria-labelledby={`${titleId}_${descriptionId}`}
      >
        <title id={titleId} className="echScreenReaderOnly">
          {trendA11yTitle}
        </title>
        <text id={descriptionId} className="echScreenReaderOnly" fontSize={0}>
          {trendA11yDescription}
        </text>

        <rect x={0} y={0} width={1} height={1} fill={color} />

        {path && (
          <path
            d={path.area(sortedTrendData)}
            transform="translate(0, 0.5),scale(1,0.5)"
            fill={getSparkLineColor(color)}
            stroke="none"
            strokeWidth={0}
          />
        )}
      </svg>
    </div>
  );
};
