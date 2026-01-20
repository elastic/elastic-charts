/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import type { PartialTheme, TooltipHeaderFormatter } from '@elastic/charts';
import { Axis, BarSeries, Chart, LegendValue, Position, ScaleType, Settings, Tooltip } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const onElementListeners = {
  onElementClick: action('onElementClick'),
  onElementOver: action('onElementOver'),
  onElementOut: action('onElementOut'),
  onProjectionClick: action('onProjectionClick'),
};

export const Example: ChartsStory = (_, { title, description }) => {
  const baseTheme = useBaseTheme();
  const useObjectAsX = boolean('use object on x', false);
  const useDimmedColors = boolean('Enable dimmed colors on unhighlight', true);

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

  const defaultShade = baseTheme.theme === 'light' ? 'rgba(202, 211, 226, 0.35)' : 'rgba(142, 159, 188, 0.35)';

  const dimmedFillColor = useDimmedColors ? select('Dimmed fill color', shadeOptions, defaultShade) : undefined;

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
      }
    : {
        barSeriesStyle: {
          rect: {
            dimmed: undefined,
          },
        },
      };

  const headerFormatter: TooltipHeaderFormatter = ({ value }) => {
    if (value % 2 === 0) {
      return (
        <div>
          <p>special header for even x values</p>
          <p>{value}</p>
        </div>
      );
    }

    return value;
  };

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        baseTheme={baseTheme}
        theme={customTheme}
        legendPosition={Position.Right}
        {...onElementListeners}
      />
      <Tooltip headerFormatter={headerFormatter} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars1"
        name="Series 1"
        xScaleType={useObjectAsX ? ScaleType.Ordinal : ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={useObjectAsX ? 'sObj' : 'x'}
        yAccessors={['y']}
        data={[
          { x: 0, y: 2, obj: { from: 10, to: 20 }, sObj: 'from 10 to 20' },
          { x: 1, y: 7, obj: { from: 20, to: 30 }, sObj: 'from 20 to 30' },
          { x: 2, y: -3, obj: { from: 30, to: 40 }, sObj: 'from 30 to 40' },
          { x: 3, y: 6, obj: { from: 40, to: 50 }, sObj: 'from 40 to 50' },
        ]}
      />
      <BarSeries
        id="bars2"
        name="Series 2"
        xScaleType={useObjectAsX ? ScaleType.Ordinal : ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={useObjectAsX ? 'sObj' : 'x'}
        yAccessors={['y']}
        data={[
          { x: 0, y: 3, obj: { from: 10, to: 20 }, sObj: 'from 10 to 20' },
          { x: 1, y: 5, obj: { from: 20, to: 30 }, sObj: 'from 20 to 30' },
          { x: 2, y: 4, obj: { from: 30, to: 40 }, sObj: 'from 30 to 40' },
          { x: 3, y: 8, obj: { from: 40, to: 50 }, sObj: 'from 40 to 50' },
        ]}
      />
      <BarSeries
        id="bars3"
        name="Series 3"
        xScaleType={useObjectAsX ? ScaleType.Ordinal : ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={useObjectAsX ? 'sObj' : 'x'}
        yAccessors={['y']}
        data={[
          { x: 0, y: 4, obj: { from: 10, to: 20 }, sObj: 'from 10 to 20' },
          { x: 1, y: 6, obj: { from: 20, to: 30 }, sObj: 'from 20 to 30' },
          { x: 2, y: 5, obj: { from: 30, to: 40 }, sObj: 'from 30 to 40' },
          { x: 3, y: 3, obj: { from: 40, to: 50 }, sObj: 'from 40 to 50' },
        ]}
      />
      <BarSeries
        id="bars4"
        name="Series 4"
        xScaleType={useObjectAsX ? ScaleType.Ordinal : ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={useObjectAsX ? 'sObj' : 'x'}
        yAccessors={['y']}
        data={[
          { x: 0, y: 5, obj: { from: 10, to: 20 }, sObj: 'from 10 to 20' },
          { x: 1, y: 4, obj: { from: 20, to: 30 }, sObj: 'from 20 to 30' },
          { x: 2, y: 6, obj: { from: 30, to: 40 }, sObj: 'from 30 to 40' },
          { x: 3, y: 7, obj: { from: 40, to: 50 }, sObj: 'from 40 to 50' },
        ]}
      />
    </Chart>
  );
};
