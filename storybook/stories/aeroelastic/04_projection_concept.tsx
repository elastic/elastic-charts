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
import { Canvas } from '@elastic/charts/src/common/canvas_components/view_components';

import { data } from './data';

const yDomain = { min: 0, max: 600000 };
const xDomain = { min: 0, max: 6000 };

const charts = (buckets: number) => {
  return (
    <>
      <div />
      <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 255, 0.03)' }}></div>
      <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255, 0, 0, 0.03)' }}></div>
      <Chart>
        <Settings
          theme={{ colors: { vizColors: ['#2b8cbe'] }, background: { color: 'white' } }}
          tooltip={{
            type: TooltipType.Follow,
            snap: false,
          }}
          debug={boolean('debug', false)}
          pointBuffer={(r) => 20 / r}
          xDomain={xDomain}
        />
        <Axis
          id="bottom"
          position={Position.Bottom}
          title="Ground living area"
          ticks={5}
          style={{
            tickLine: {
              size: 5,
              padding: 3,
            },
          }}
          gridLine={{
            visible: true,
            stroke: '#eaeaea',
          }}
        />
        <Axis
          id="left2"
          title="Sale price (k$)"
          position={Position.Left}
          ticks={5}
          tickFormat={(d) => `${d / 1000}`}
          style={{
            tickLine: {
              size: 5,
              padding: 3,
            },
          }}
          gridLine={{
            visible: true,
            stroke: '#eaeaea',
          }}
          domain={yDomain}
        />

        <BubbleSeries
          id="Sale price (k$)"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          bubbleSeriesStyle={{
            point: {
              shape: 'circle',
              fill: '__use__series__color__',
              opacity: 0.1,
              radius: 4,
            },
          }}
          data={data}
        />
      </Chart>
      <Chart>
        <Settings
          theme={{
            colors: { vizColors: ['#74a9cf'] },
            chartMargins: {
              bottom: 0,
              left: 55,
              right: 23,
              top: 0,
            },
            scales: {
              histogramPadding: 0.01,
            },
          }}
        />
        <Axis id="x" position={Position.Bottom} tickFormat={(d) => `${d} - ${d + xDomain.max / buckets}`} hide />
        <BarSeries
          id="# of apartments"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          minBarHeight={1}
          enableHistogramMode
          data={[
            ...data
              .reduce((acc, curr) => {
                const band = xDomain.max / buckets;
                const x = Math.floor(curr[0] / band) * band;
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
          theme={{
            colors: { vizColors: ['#74a9cf'] },
            chartMargins: {
              bottom: 48,
              left: 0,
              right: 0,
              top: 17,
            },
            scales: {
              histogramPadding: 0.01,
            },
          }}
          rotation={90}
          xDomain={Array.from({ length: buckets }, (d, i) => (i * yDomain.max) / buckets).reverse()}
        />
        <Axis
          id="x"
          position={Position.Left}
          tickFormat={(d) => `${d / 1000}k$ - ${d / 1000 + yDomain.max / buckets}k$`}
          hide
        />
        <BarSeries
          id="# of apartments"
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          minBarHeight={1}
          enableHistogramMode
          data={[
            ...data
              .reduce((acc, curr) => {
                const band = yDomain.max / buckets;
                const x = Math.floor(curr[1] / band) * band;
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
};

const chartDescriptors = [
  {
    id: 'group_marginalScatter',
    group: true,
    position: { left: 200, top: 161, width: 589, height: 389, angle: 0, parent: null },
  },
  {
    id: 'verticalConstraint',
    position: { left: 20, top: 250, width: 1000, height: 300, angle: 0, parent: null },
  },
  {
    id: 'horizontalConstraint',
    position: { left: 200, top: 20, width: 500, height: 700, angle: 0, parent: null },
  },
  {
    id: 'bubbles',
    position: { left: 200, top: 250, width: 500, height: 300, angle: 0, parent: 'group_marginalScatter' },
  },
  {
    id: 'barsOnTop',
    position: { left: 200, top: 161, width: 500, height: 80, angle: 0, parent: 'group_marginalScatter' },
  },
  {
    id: 'barsOnSide',
    position: { left: 709, top: 250, width: 80, height: 300, angle: 0, parent: 'group_marginalScatter' },
  },
];

export const Example = () => {
  // const buckets = number('buckets', 12, { min: 1, max: 48, step: 1, range: true });
  return <Canvas charts={charts(24)} chartDescriptors={chartDescriptors}></Canvas>;
};

Example.parameters = {
  background: { default: 'white' },
};
