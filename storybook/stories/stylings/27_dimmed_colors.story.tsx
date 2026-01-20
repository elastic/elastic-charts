/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, boolean } from '@storybook/addon-knobs';
import React from 'react';

import type { PartialTheme } from '@elastic/charts';
import {
  Axis,
  BarSeries,
  LineSeries,
  AreaSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  LegendValue,
  CurveType,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dg = new SeededDataGenerator();
const barData = dg.generateGroupedSeries(10, 4);
const lineData = dg.generateSimpleSeries(10);
const areaData = dg.generateSimpleSeries(10);

const shadeOptions = {
  'shade30 @ 15% (lighter)': 'rgba(202, 211, 226, 0.15)',
  'shade30 @ 20%': 'rgba(202, 211, 226, 0.20)',
  'shade30 @ 25%': 'rgba(202, 211, 226, 0.25)',
  'shade30 @ 30%': 'rgba(202, 211, 226, 0.30)',
  'shade30 @ 35% (default light)': 'rgba(202, 211, 226, 0.35)',
  'shade30 @ 40%': 'rgba(202, 211, 226, 0.40)',
  'shade30 @ 45%': 'rgba(202, 211, 226, 0.45)',
  'shade30 @ 50% (darker)': 'rgba(202, 211, 226, 0.50)',
  'shade60 @ 15% (lighter)': 'rgba(142, 159, 188, 0.15)',
  'shade60 @ 20%': 'rgba(142, 159, 188, 0.20)',
  'shade60 @ 25%': 'rgba(142, 159, 188, 0.25)',
  'shade60 @ 30%': 'rgba(142, 159, 188, 0.30)',
  'shade60 @ 35% (default dark)': 'rgba(142, 159, 188, 0.35)',
  'shade60 @ 40%': 'rgba(142, 159, 188, 0.40)',
  'shade60 @ 45%': 'rgba(142, 159, 188, 0.45)',
  'shade60 @ 50% (darker)': 'rgba(142, 159, 188, 0.50)',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const baseTheme = useBaseTheme();
  const useDimmedColors = boolean('Enable dimmed colors on unhighlight', true);
  
  const defaultShade = baseTheme.theme === 'light' 
    ? 'rgba(202, 211, 226, 0.35)' 
    : 'rgba(142, 159, 188, 0.35)';
  
  const dimmedFillColor = select(
    'Dimmed fill color',
    shadeOptions,
    defaultShade,
  );

  const customTheme: PartialTheme = useDimmedColors
    ? {
        barSeriesStyle: {
          rect: {
            dimmed: {
              fill: dimmedFillColor,
              texture: { opacity: 0.25 },
            },
          },
        },
        lineSeriesStyle: {
          line: {
            dimmed: {
              strokeWidth: 1,
              stroke: dimmedFillColor,
            },
          },
          point: {
            dimmed: {
              stroke: dimmedFillColor,
              strokeWidth: 1,
              opacity: 0.5,
            },
          },
        },
        areaSeriesStyle: {
          area: {
            dimmed: {
              fill: dimmedFillColor,
              texture: { opacity: 0.25 },
            },
          },
          line: {
            dimmed: {
              strokeWidth: 1,
              stroke: dimmedFillColor,
            },
          },
          point: {
            dimmed: {
              stroke: dimmedFillColor,
              strokeWidth: 1,
              opacity: 0.5,
            },
          },
        },
      }
    : {
        barSeriesStyle: {
          rect: {
            dimmed: undefined,
          },
        },
        lineSeriesStyle: {
          line: {
            dimmed: undefined,
          },
          point: {
            dimmed: undefined,
          },
        },
        areaSeriesStyle: {
          area: {
            dimmed: undefined,
          },
          line: {
            dimmed: undefined,
          },
          point: {
            dimmed: undefined,
          },
        },
      };

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={Position.Right}
        theme={customTheme}
        baseTheme={baseTheme}
      />
      <Axis id="bottom" position={Position.Bottom} title="X axis" showOverlappingTicks />
      <Axis id="left" title="Y axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars"
        name="Bar series"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        stackAccessors={['x']}
        data={barData}
      />
      <LineSeries
        id="lines"
        name="Line series"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        curve={CurveType.CURVE_MONOTONE_X}
        data={lineData}
        lineSeriesStyle={{
          point: {
            visible: true,
            radius: 4,
          },
        }}
      />
      <AreaSeries
        id="areas"
        name="Area series"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        curve={CurveType.CURVE_MONOTONE_X}
        data={areaData}
        areaSeriesStyle={{
          point: {
            visible: true,
            radius: 3,
          },
        }}
      />
    </Chart>
  );
};
