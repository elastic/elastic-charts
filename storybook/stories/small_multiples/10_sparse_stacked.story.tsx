/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import {
  AreaSeries,
  Axis,
  BarSeries,
  Chart,
  GroupBy,
  LineSeries,
  Position,
  ScaleType,
  Settings,
  SmallMultiples,
} from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const xRange = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

const presence: Record<string, Record<string, number[]>> = {
  'panel A': { g1: xRange(0, 10), g2: xRange(0, 10), g3: xRange(0, 10) },
  'panel B': { g1: xRange(0, 9), g2: [...xRange(0, 2), ...xRange(7, 9)], g3: xRange(5, 9) },
  'panel C': { g1: xRange(3, 7), g2: [0, 4, 9], g3: xRange(0, 9) },
};

const data = Object.entries(presence).flatMap(([panel, series], p) =>
  Object.entries(series).flatMap(([g, xs], s) =>
    xs.map((x) => ({ panel, g, x, y: 1 + ((x * 7 + s * 3 + p * 5) % 9) })),
  ),
);

export const Example: ChartsStory = (_, { title, description }) => {
  const seriesType = select('series type', { bar: 'bar', area: 'area', line: 'line' }, 'bar');
  const seriesProps = {
    id: 'sparse',
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    splitSeriesAccessors: ['g'],
    stackAccessors: ['x'],
    data,
  };
  return (
    <Chart title={title} description={description}>
      <Settings showLegend baseTheme={useBaseTheme()} />
      <Axis id="x" position={Position.Bottom} />
      <Axis id="y" position={Position.Left} />
      <GroupBy id="panels" by={(_spec, datum) => datum.panel} sort="alphaAsc" />
      <SmallMultiples splitVertically="panels" />
      {seriesType === 'bar' && <BarSeries {...seriesProps} />}
      {seriesType === 'area' && <AreaSeries {...seriesProps} />}
      {seriesType === 'line' && <LineSeries {...seriesProps} />}
    </Chart>
  );
};
