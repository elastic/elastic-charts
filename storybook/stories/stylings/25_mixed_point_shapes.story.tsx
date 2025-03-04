/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { color, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  Position,
  Settings,
  AreaSeries,
  LineSeries,
  BubbleSeries,
  ScaleType,
  PointShape,
} from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const shapeKnobArea = select(
    'area series marker shape',
    ['circle', 'diamond', 'square', 'triangle', 'plus', 'x'],
    PointShape.Circle,
  );
  const strokeKnobArea = color('area series stroke color', '#54B399');
  const fillKnobArea = color('area series fill color', 'white');

  const shapeKnobLine = select(
    'line series marker shape',
    ['circle', 'diamond', 'square', 'triangle', 'plus', 'x'],
    PointShape.Circle,
  );
  const strokeKnobLine = color('line series stroke color', '#6092C0');
  const fillKnobLine = color('line series fill color', 'white');

  const shapeKnobBubble = select(
    'bubble marker series shape',
    ['circle', 'diamond', 'square', 'triangle', 'plus', 'x'],
    PointShape.Circle,
  );
  const strokeKnobBubble = color('bubble series stroke color', '#D36086');
  const fillKnobBubble = color('bubble series fill color', 'white');

  return (
    <Chart title={title} description={description} className="story-chart">
      <Settings baseTheme={useBaseTheme()} showLegend />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      <AreaSeries
        id="areas"
        areaSeriesStyle={{
          point: {
            shape: shapeKnobArea,
            stroke: strokeKnobArea,
            fill: fillKnobArea,
            strokeWidth: 1,
          },
        }}
        xAccessor="x"
        yAccessors={['y']}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        data={[
          { x: 0, y: 2.5 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
      <LineSeries
        id="lines"
        lineSeriesStyle={{
          point: {
            radius: 20,
            shape: shapeKnobLine,
            stroke: strokeKnobLine,
            fill: fillKnobLine,
            strokeWidth: 1,
          },
        }}
        xAccessor="x"
        yAccessors={['y']}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        data={[
          { x: 0, y: 2.8 },
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 10 },
        ]}
      />
      <BubbleSeries
        id="bubbles"
        bubbleSeriesStyle={{
          point: {
            radius: 20,
            shape: shapeKnobBubble,
            stroke: strokeKnobBubble,
            fill: fillKnobBubble,
            strokeWidth: 1,
          },
        }}
        xAccessor="x"
        yAccessors={['y']}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        data={[
          { x: 0, y: 5 },
          { x: 1, y: 8 },
          { x: 2, y: 9 },
          { x: 3, y: 10 },
        ]}
      />
    </Chart>
  );
};
