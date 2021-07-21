/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, select } from '@storybook/addon-knobs';
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
} from '../../packages/charts/src';
import { SB_KNOBS_PANEL } from '../utils/storybook';

export const Example = () => {
  const alignLegendPointStyles = boolean('align legend point style', true);

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
    <Chart className="story-chart">
      <Settings showLegend alignLegendPointStyles={alignLegendPointStyles} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      <AreaSeries
        id="areas"
        areaSeriesStyle={{
          point: {
            shape: shapeKnobArea,
            stroke: strokeKnobArea,
            fill: fillKnobArea,
          },
        }}
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
          },
        }}
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
          },
        }}
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

Example.story = {
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
  },
};
