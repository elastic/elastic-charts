/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { LineSeries, Chart, ScaleType, Settings, Position, Axis } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const themeOverrides = {
    markSizeRatio: 5.3999999999999995,
    barSeriesStyle: {
      displayValue: {
        fontSize: { min: 10, max: 12 },
        fill: { textInverted: false, textContrast: true },
        // alignment: { horizontal: 'center', vertical: 'middle' },
      },
    },
    legend: { labelOptions: { maxLines: 1 } },
    axes: { axisTitle: { padding: { outer: 10 } } },
    chartMargins: { bottom: 10 },
  };
  const theme = {
    background: { color: 'rgba(255, 255, 255, 1)' },
    chartMargins: { left: 0, right: 0, top: 0, bottom: 0 },
    lineSeriesStyle: { line: { strokeWidth: 2 }, point: { fill: 'rgba(255, 255, 255, 1)', strokeWidth: 2, radius: 3 } },
    areaSeriesStyle: {
      area: { opacity: 0.3 },
      line: { strokeWidth: 2 },
      point: { visible: false, fill: 'rgba(255, 255, 255, 1)', strokeWidth: 2, radius: 3 },
    },
    barSeriesStyle: {
      displayValue: {
        fontSize: 8,
        fontFamily:
          "'Inter', 'Inter UI', -apple-system, BlinkMacSystemFont,\n  'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        fill: 'rgba(106, 113, 125, 1)',
      },
    },
    scales: { barsPadding: 0.25, histogramPadding: 0.05 },
    axes: {
      axisTitle: {
        fontSize: 12,
        fontFamily:
          "'Inter', 'Inter UI', -apple-system, BlinkMacSystemFont,\n  'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        fill: 'rgba(52, 55, 65, 1)',
        padding: { inner: 10, outer: 0 },
      },
      axisLine: { stroke: 'rgba(238, 240, 243, 1)' },
      tickLabel: {
        fontSize: 10,
        fontFamily:
          "'Inter', 'Inter UI', -apple-system, BlinkMacSystemFont,\n  'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        fill: 'rgba(106, 113, 125, 1)',
        padding: { outer: 8, inner: 10 },
      },
      tickLine: { visible: false, stroke: 'rgba(238, 240, 243, 1)', strokeWidth: 1 },
      gridLine: {
        horizontal: { visible: true, stroke: 'rgba(238, 240, 243, 1)', strokeWidth: 1, opacity: 1, dash: [0, 0] },
        vertical: { visible: true, stroke: 'rgba(238, 240, 243, 1)', strokeWidth: 1, opacity: 1, dash: [4, 4] },
      },
    },
    colors: {
      vizColors: [
        '#54B399',
        '#6092C0',
        '#9170B8',
        '#CA8EAE',
        '#D36086',
        '#E7664C',
        '#AA6556',
        '#DA8B45',
        '#B9A888',
        '#D6BF57',
      ],
      defaultVizColor: '#6092C0',
    },
    crosshair: {
      band: { fill: 'rgba(245, 247, 250, 1)' },
      line: { stroke: 'rgba(105, 112, 125, 1)', strokeWidth: 1, dash: [4, 4] },
      crossLine: { stroke: 'rgba(105, 112, 125, 1)', strokeWidth: 1, dash: [4, 4] },
    },
    goal: {
      tickLabel: {
        fontFamily:
          "'Inter', 'Inter UI', -apple-system, BlinkMacSystemFont,\n  'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        fill: 'rgba(106, 113, 125, 1)',
      },
      majorLabel: {
        fontFamily:
          "'Inter', 'Inter UI', -apple-system, BlinkMacSystemFont,\n  'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        fill: 'rgba(52, 55, 65, 1)',
      },
      minorLabel: {
        fontFamily:
          "'Inter', 'Inter UI', -apple-system, BlinkMacSystemFont,\n  'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        fill: 'rgba(106, 113, 125, 1)',
      },
      majorCenterLabel: {
        fontFamily:
          "'Inter', 'Inter UI', -apple-system, BlinkMacSystemFont,\n  'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        fill: 'rgba(52, 55, 65, 1)',
      },
      minorCenterLabel: {
        fontFamily:
          "'Inter', 'Inter UI', -apple-system, BlinkMacSystemFont,\n  'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        fill: 'rgba(106, 113, 125, 1)',
      },
      targetLine: { stroke: 'rgba(52, 55, 65, 1)' },
      tickLine: { stroke: 'rgba(152, 162, 179, 1)' },
      progressLine: { stroke: 'rgba(52, 55, 65, 1)' },
    },
  };
  return (
    <Chart>
      <Settings theme={[themeOverrides, theme]} baseTheme={useBaseTheme()} />
      <Axis id="y" position={Position.Left} />
      <Axis id="x" position={Position.Bottom} />
      <LineSeries
        fit="linear"
        id="line"
        xScaleType={ScaleType.Time}
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 10 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
