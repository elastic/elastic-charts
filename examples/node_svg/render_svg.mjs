/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { writeFileSync } from 'node:fs';

import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  LineAnnotation,
  LineSeries,
  Position,
  RectAnnotation,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { renderChartToSVGString } from '@elastic/charts/server';

const output = process.argv[2] ?? 'chart.svg';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const visits = [12, 19, 7, 15, 22].map((y, i) => ({ x: days[i], y }));
const target = [14, 14, 15, 16, 17].map((y, i) => ({ x: days[i], y }));

const h = React.createElement;
const svg = renderChartToSVGString(
  h(
    Chart,
    { id: 'visits', size: { width: 700, height: 320 } },
    h(Settings, { showLegend: true, legendPosition: Position.Bottom, theme: { chartMargins: { right: 70 } } }),
    h(Axis, { id: 'x', position: Position.Bottom }),
    h(Axis, { id: 'y', position: Position.Left }),
    h(BarSeries, {
      id: 'Visits',
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      data: visits,
    }),
    h(LineSeries, {
      id: 'Target',
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      data: target,
    }),
    h(LineAnnotation, {
      id: 'threshold',
      domainType: 'yDomain',
      dataValues: [{ dataValue: 20, details: 'Capacity' }],
      marker: '◀ Capacity',
      markerPosition: Position.Right,
      style: { line: { stroke: '#BD271E', strokeWidth: 1.5, opacity: 1, dash: [4, 4] } },
    }),
    h(RectAnnotation, {
      id: 'outage',
      dataValues: [{ coordinates: { x0: 'Wed', x1: 'Wed' } }],
      style: { fill: '#F5A700', opacity: 0.15 },
    }),
  ),
);

writeFileSync(output, `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`);
console.log(`wrote ${output}`);
