/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { array, boolean, color, number } from '@storybook/addon-knobs';
import { startCase } from 'lodash';
import React from 'react';

import {
  Axis,
  LineSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  TooltipType,
  PartialTheme,
  StrokeStyle,
  StrokeDashArray,
  Tooltip,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const dg = new SeededDataGenerator();
const data = dg.generateBasicSeries(20);

type LineProps = StrokeStyle & StrokeDashArray;

const getLineStyles = ({ stroke, strokeWidth, dash }: Partial<LineProps> = {}, group?: string): LineProps => ({
  stroke: color('Stroke', stroke ?? '#ccc', group),
  strokeWidth: number('Stroke width', strokeWidth ?? 2, { min: 1, max: 6, range: true, step: 1 }, group),
  dash: (
    array(
      'Dash',
      (dash ?? []).map((n) => `${n}`),
      ',',
      group,
    ) ?? []
  ).map((s) => parseInt(s, 10)),
});

const getAxisKnobs = (position: Position) => {
  const title = `${startCase(position)} axis`;
  const visible = boolean('Show gridline', true, title);
  return {
    id: position,
    position,
    title,
    tickFormat: (n: number) => n.toFixed(1),
    gridLine: {
      visible,
      opacity: number('Opacity', 0.2, { min: 0, max: 1, range: true, step: 0.1 }, title),
      ...getLineStyles(
        {
          dash: position === Position.Left ? [4, 4] : undefined,
        },
        title,
      ),
    },
  };
};

export const Example: ChartsStory = (_, { title, description }) => {
  const theme: PartialTheme = {
    crosshair: {
      line: getLineStyles({ stroke: 'red' }, 'Crosshair line'),
      crossLine: getLineStyles({ stroke: 'red', dash: [4, 4] }, 'Crosshair cross line'),
    },
  };
  return (
    <Chart title={title} description={description}>
      <Settings debug={boolean('debug', false)} theme={theme} baseTheme={useBaseTheme()} />
      <Tooltip type={customKnobs.enum.tooltipType('Tooltip type', TooltipType.Crosshairs)} />
      <Axis {...getAxisKnobs(Position.Left)} />
      <Axis {...getAxisKnobs(Position.Bottom)} />
      <LineSeries
        id="line"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};
