/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { select } from '@storybook/addon-knobs';
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
  const shapeKnobArea = select('area series marker shape', PointShape, PointShape.Circle);
  const shapeKnobLine = select('line series marker shape', PointShape, PointShape.Circle);
  const shapeKnobBubble = select('bubble marker series shape', PointShape, PointShape.Circle);

  return (
    <Chart className="story-chart">
      <Settings showLegend />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      <AreaSeries
        id="areas"
        areaSeriesStyle={{
          point: {
            shape: shapeKnobArea,
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
            shape: shapeKnobLine,
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
            shape: shapeKnobBubble,
            radius: 20,
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
