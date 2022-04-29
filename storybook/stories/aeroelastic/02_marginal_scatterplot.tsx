/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, BubbleSeries, Position, ScaleType, Settings, TooltipType, BarSeries } from '@elastic/charts';
import { Canvas } from '@elastic/charts/src/common/aeroelastic/mini_canvas/view_components';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

const dg = new SeededDataGenerator();
const data = dg.generateRandomSeries(600);

const charts = (
  <>
    <Chart>
      <Settings
        tooltip={{
          type: TooltipType.Follow,
          snap: false,
        }}
        debug={boolean('debug', false)}
        pointBuffer={(r) => 20 / r}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" ticks={5} />
      <Axis id="left2" title="Left axis" position={Position.Left} ticks={5} />

      <BubbleSeries
        id="bubbles"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        bubbleSeriesStyle={{
          point: {
            shape: 'circle',
            fill: '__use__series__color__',
            opacity: 0.8,
          },
        }}
        data={data}
      />
    </Chart>
    <Chart>
      <Settings
        tooltip={{
          type: TooltipType.Follow,
          snap: false,
        }}
        theme={{
          chartMargins: {
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
          },
        }}
      />
      <Axis
        id="title"
        position={Position.Top}
        title="X"
        style={{
          axisLine: {
            visible: false,
          },
          tickLabel: {
            visible: false,
          },
          tickLine: {
            visible: false,
          },
        }}
      />

      <BarSeries
        id="horizontal"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={[
          ...data
            .reduce((acc, curr) => {
              const x = Math.floor(curr.x / 10);
              const y = acc.get(x) ?? 0;
              acc.set(x, y + 1);
              return acc;
            }, new Map<number, number>())
            .entries(),
        ]}
      />
    </Chart>
    <Chart>
      <Settings
        tooltip={{
          type: TooltipType.Follow,
          snap: false,
        }}
        debug={boolean('debug', false)}
        pointBuffer={(r) => 20 / r}
        theme={{
          chartMargins: {
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
          },
        }}
      />
      <Axis
        id="bottom"
        position={Position.Top}
        title="Y"
        style={{
          axisLine: {
            visible: false,
          },
          tickLabel: {
            visible: false,
          },
          tickLine: {
            visible: false,
          },
        }}
      />

      <BarSeries
        id="vertical"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={[
          ...data
            .reduce((acc, curr) => {
              const x = Math.floor(curr.y / 10);
              const y = acc.get(x) ?? 0;
              acc.set(x, y + 1);
              return acc;
            }, new Map<number, number>())
            .entries(),
        ]}
      />
    </Chart>
  </>
);

const chartDescriptors = [
  {
    id: 'sampleElement0',
    position: { left: 0, top: 150, width: 500, height: 300, angle: 0, parent: null },
  },
  {
    id: 'sampleElement1',
    position: { left: 68, top: 51, width: 432, height: 100, angle: 0, parent: null },
  },
  {
    id: 'sampleElement2',
    position: { left: 437, top: 230, width: 225, height: 100, angle: 90, parent: null },
  },
];

export const Example = () => <Canvas charts={charts} chartDescriptors={chartDescriptors}></Canvas>;

Example.parameters = {
  background: { default: 'white' },
};
