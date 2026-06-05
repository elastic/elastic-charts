/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select, text } from '@storybook/addon-knobs';
import React from 'react';

import type { AxisStyle, RecursivePartial, Rotation } from '@elastic/charts';
import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';
import { getNumberSelectKnob } from '../utils/knobs/custom';

const CHART_CONFIG_GROUP = 'Chart config';
const AXIS_X_GROUP = 'Axis X';
const AXIS_Y_GROUP = 'Axis Y';

const data = [
  { category: 'this is the longest category name in this story', value: 47 },
  { category: 'this is an even longer category name', value: 36 },
  { category: 'this is a long category name', value: 28 },
  { category: 'another category', value: 16 },
  { category: 'category name', value: 13 },
  { category: 'category', value: 8 },
  { category: 'category', value: 8 },
  { category: 'ctg', value: 3 },
];

function parseThemeSize(raw: string): number | string | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  const pct = s.match(/^([\d.]+)\s*%$/);
  if (pct) return `${pct[1]}%`;
  const n = Number(s);
  if (Number.isFinite(n)) return n;
  return s;
}

function parseTickLabelLimit(raw: string): number | undefined {
  const limit = parseThemeSize(raw);
  return typeof limit === 'number' ? limit : undefined;
}

const getWrapAxisKnobs = (group: string) => {
  const rotation = number('rotation', 0, { range: true, min: -90, max: 90, step: 1 }, group);
  const alignmentVertical = customKnobs.enum.verticalTextAlignment('Alignment Vertical', undefined, { group });
  const alignmentHorizontal = customKnobs.enum.horizontalTextAlignment('Alignment Horizontal', undefined, {
    group,
  });
  const tickLabelLimit = parseTickLabelLimit(text('Tick label limit', '', group));
  const minExtent = parseThemeSize(text('minExtent', '', group));
  const maxExtent = parseThemeSize(text('maxExtent', '', group));
  const wrapLines = number('wrapLines', 2, { min: 1, max: 10, step: 1 }, group);
  const lineHeight = number('lineHeight', 1.2, { min: 0, max: 2, step: 0.1 }, group);
  const showOverlapping = boolean('show overlapping', false, group);
  const truncate = select('truncate', { end: 'end', start: 'start', middle: 'middle' }, 'end', group);

  return {
    rotation,
    alignmentVertical,
    alignmentHorizontal,
    tickLabelLimit,
    minExtent,
    maxExtent,
    wrapLines,
    lineHeight,
    showOverlapping,
    truncate,
  };
};

const buildAxisStyle = (knobs: ReturnType<typeof getWrapAxisKnobs>): RecursivePartial<AxisStyle> => {
  const {
    rotation,
    lineHeight,
    wrapLines,
    tickLabelLimit,
    minExtent,
    maxExtent,
    alignmentHorizontal,
    alignmentVertical,
    truncate,
  } = knobs;
  const alignment =
    alignmentHorizontal !== undefined || alignmentVertical !== undefined
      ? {
          ...(alignmentHorizontal !== undefined && { horizontal: alignmentHorizontal }),
          ...(alignmentVertical !== undefined && { vertical: alignmentVertical }),
        }
      : undefined;

  return {
    ...(minExtent !== undefined && { minExtent }),
    ...(maxExtent !== undefined && { maxExtent }),
    tickLabel: {
      rotation,
      lineHeight,
      wrapLines,
      ...(tickLabelLimit !== undefined && { limit: tickLabelLimit }),
      ...(alignment !== undefined && { alignment }),
      ...(truncate !== undefined && { truncate }),
    },
  };
};

export const Example: ChartsStory = (_, { title, description }) => {
  const chartRotation = getNumberSelectKnob<Rotation>(
    'Chart rotation',
    { '0 deg': 0, '90 deg': 90, '-90 deg': -90, '180 deg': 180 },
    0,
    CHART_CONFIG_GROUP,
  );
  const barCount = number('Number of bars', data.length, { min: 1, max: data.length, step: 1 }, CHART_CONFIG_GROUP);
  const debug = boolean('debug', true, CHART_CONFIG_GROUP);

  const xPosition = select('Position', { Bottom: Position.Bottom, Top: Position.Top }, Position.Bottom, AXIS_X_GROUP);
  const yPosition = select('Position', { Left: Position.Left, Right: Position.Right }, Position.Left, AXIS_Y_GROUP);

  const axisXKnobs = getWrapAxisKnobs(AXIS_X_GROUP);
  const axisYKnobs = getWrapAxisKnobs(AXIS_Y_GROUP);

  return (
    <Chart title={title} description={description}>
      <Settings debug={debug} baseTheme={useBaseTheme()} rotation={chartRotation} />
      <Axis
        id="x-axis"
        position={xPosition}
        title="X axis"
        showOverlappingTicks={axisXKnobs.showOverlapping}
        style={buildAxisStyle(axisXKnobs)}
      />
      <Axis
        id="y-axis"
        position={yPosition}
        title="Y axis"
        showOverlappingTicks={axisYKnobs.showOverlapping}
        style={buildAxisStyle(axisYKnobs)}
      />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="category"
        yAccessors={['value']}
        data={data.slice(0, barCount)}
      />
    </Chart>
  );
};
