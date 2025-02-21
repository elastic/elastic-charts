/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import type { AxisStyle, RecursivePartial } from '@elastic/charts';
import {
  AreaSeries,
  Axis,
  Chart,
  Position,
  ScaleType,
  Settings,
  LEGACY_CHART_MARGINS,
  DEFAULT_CHART_PADDING,
} from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const getAxisKnobs = (group?: string, gridLines = false): RecursivePartial<AxisStyle> => ({
  axisTitle: {
    visible: !boolean('Hide axis title', false, group),
    padding: {
      outer: customKnobs.positiveNumber('Axis title padding - outer', 6, group),
      inner: customKnobs.positiveNumber('Axis title padding - inner', 6, group),
    },
  },
  axisLine: {
    visible: !boolean('Hide axis line', false, group),
  },
  tickLine: {
    visible: !boolean('Hide tick lines', false, group),
    padding: customKnobs.positiveNumber('Tick line padding', 10, group),
    size: customKnobs.positiveNumber('Tick line size', 10, group),
  },
  tickLabel: {
    visible: !boolean('Hide tick labels', false, group),
    rotation: number(
      'Tick label rotation',
      0,
      {
        range: true,
        min: -90,
        max: 90,
        step: 1,
      },
      group,
    ),
    padding: {
      outer: customKnobs.positiveNumber('Tick label padding - outer', 0, group),
      inner: customKnobs.positiveNumber('Tick label padding - inner', 0, group),
    },
    offset: {
      y: number(
        'Tick label y offset',
        0,
        {
          range: true,
          min: -10,
          max: 10,
          step: 1,
        },
        group,
      ),
      x: number(
        'Tick label x offset',
        0,
        {
          range: true,
          min: -10,
          max: 10,
          step: 1,
        },
        group,
      ),
      reference: select(
        'Tick label offset reference',
        {
          Global: 'global',
          Local: 'local',
        },
        'local',
        group,
      ),
    },
    alignment: {
      vertical: customKnobs.enum.verticalTextAlignment(group),
      horizontal: customKnobs.enum.horizontalTextAlignment(group),
    },
  },
  ...(gridLines && {
    gridLine: {
      horizontal: {
        visible: boolean('show horizontal gridLines', false, group),
      },
      vertical: {
        visible: boolean('show vertical gridLines', false, group),
      },
    },
  }),
});

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false, 'general');
  const onlyGlobal = !boolean('disable axis overrides', false, 'general');
  const chartMargins = {
    left: customKnobs.positiveNumber('margin left', LEGACY_CHART_MARGINS.left, 'general'),
    right: customKnobs.positiveNumber('margin right', LEGACY_CHART_MARGINS.right, 'general'),
    top: customKnobs.positiveNumber('margin top', LEGACY_CHART_MARGINS.top, 'general'),
    bottom: customKnobs.positiveNumber('margin bottom', LEGACY_CHART_MARGINS.bottom, 'general'),
  };
  const chartPaddings = {
    left: customKnobs.positiveNumber('padding left', DEFAULT_CHART_PADDING.left, 'general'),
    right: customKnobs.positiveNumber('padding right', DEFAULT_CHART_PADDING.right, 'general'),
    top: customKnobs.positiveNumber('padding top', DEFAULT_CHART_PADDING.top, 'general'),
    bottom: customKnobs.positiveNumber('padding bottom', DEFAULT_CHART_PADDING.bottom, 'general'),
  };
  const bottomAxisStyles = getAxisKnobs(Position.Bottom);
  const leftAxisStyles = getAxisKnobs(Position.Left);
  const topAxisStyles = getAxisKnobs(Position.Top);
  const rightAxisStyles = getAxisKnobs(Position.Right);
  const theme = {
    axes: getAxisKnobs('shared', true),
    chartMargins,
    chartPaddings,
  };

  return (
    <Chart title={title} description={description}>
      <Settings debug={debug} theme={theme} baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        hide={boolean('hide axis', false, Position.Bottom)}
        position={Position.Bottom}
        title="Bottom axis"
        showOverlappingTicks
        gridLine={
          onlyGlobal
            ? {
                visible: boolean('show gridLines', false, Position.Bottom),
              }
            : undefined
        }
        style={onlyGlobal ? bottomAxisStyles : undefined}
      />
      <Axis
        id="left"
        hide={boolean('hide axis', false, Position.Left)}
        title="Left axis"
        position={Position.Left}
        style={onlyGlobal ? leftAxisStyles : undefined}
        gridLine={
          onlyGlobal
            ? {
                visible: boolean('show gridLines', false, Position.Left),
              }
            : undefined
        }
      />
      <Axis
        id="top"
        hide={boolean('hide axis', false, Position.Top)}
        title="Top axis"
        position={Position.Top}
        style={onlyGlobal ? topAxisStyles : undefined}
        gridLine={
          onlyGlobal
            ? {
                visible: boolean('show gridLines', false, Position.Top),
              }
            : undefined
        }
      />
      <Axis
        id="right"
        hide={boolean('hide axis', false, Position.Right)}
        title="Right axis"
        position={Position.Right}
        style={onlyGlobal ? rightAxisStyles : undefined}
        gridLine={
          onlyGlobal
            ? {
                visible: boolean('show gridLines', false, Position.Right),
              }
            : undefined
        }
        domain={{ min: 0, max: 100 }}
      />
      <AreaSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 20 },
          { x: 1, y: 70 },
          { x: 2, y: 30 },
          { x: 3, y: 60 },
        ]}
      />
    </Chart>
  );
};
