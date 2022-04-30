/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  BubbleSeries,
  Position,
  ScaleType,
  Settings,
  TooltipType,
  BarSeries,
  Heatmap,
} from '@elastic/charts';
import { Canvas } from '@elastic/charts/src/common/canvas_components/view_components';

import { data } from './data';

const yDomain = { min: 0, max: 400000 };
const xDomain = { min: 0, max: 4000 };
const filteredData = data.filter(([x, y]) => x < xDomain.max && y < yDomain.max);

const colors = ['#6e40aa', '#5465d6', '#2f96e0', '#1ac7c2', '#28ea8d', '#60f760', '#aff05b'].map((d) => `${d}D0`);

const charts = (buckets: number) => {
  return (
    <>
      <Chart>
        <Settings
          theme={{
            axes: {
              axisLine: {
                visible: false,
              },
            },
            heatmap: {
              cell: {
                maxHeight: 'fill',
                maxWidth: 'fill',

                label: {
                  visible: false,
                },
                border: {
                  strokeWidth: 0.2,
                  stroke: 'transparent',
                },
              },
              grid: {
                stroke: {
                  width: 0,
                  color: 'transparent',
                },
                cellHeight: {
                  min: 0,
                  max: 100,
                },
              },
              yAxisLabel: {
                visible: false,
              },
              xAxisLabel: {
                visible: false,
              },
            },
          }}
          rotation={90}
          xDomain={Array.from({ length: buckets }, (d, i) => (i * yDomain.max) / buckets).reverse()}
        />

        <Heatmap
          id="# of apartments"
          colorScale={{
            type: 'bands',
            bands: [
              {
                start: -Infinity,
                end: 1,
                color: 'transparent',
              },
              {
                start: 1,
                end: 10,
                color: colors[0],
              },
              {
                start: 10,
                end: 20,
                color: colors[1],
              },
              {
                start: 20,
                end: 30,
                color: colors[2],
              },
              {
                start: 30,
                end: 40,
                color: colors[3],
              },
              {
                start: 40,
                end: 50,
                color: colors[4],
              },
              {
                start: 50,
                end: 60,
                color: colors[5],
              },
              {
                start: 60,
                end: Infinity,
                color: colors[6],
              },
            ],
          }}
          xAccessor={(d) => d[0]}
          yAccessor={(d) => d[1]}
          valueAccessor={(d) => d[2]}
          xSortPredicate="numAsc"
          ySortPredicate="numDesc"
          data={[
            ...filteredData
              .reduce(
                (acc, curr) => {
                  const xBand = xDomain.max / buckets;
                  const yBand = yDomain.max / buckets;
                  const x = Math.floor(curr[0] / xBand) * xBand;
                  const y = Math.floor(curr[1] / yBand) * yBand;
                  const key = `${x}---${y}`;
                  const existing = acc.get(key) ?? [x, y, 0];
                  acc.set(key, [x, y, existing[2] + 1]);
                  return acc;
                },
                new Map<string, [number, number, number]>(
                  Array.from({ length: buckets * buckets }, (d, i) => {
                    const x = (Math.floor(i / buckets) * xDomain.max) / buckets;
                    const y = ((i % buckets) * yDomain.max) / buckets;
                    return [`${x}--${y}`, [x, y, 0]];
                  }),
                ),
              )
              .values(),
          ]}
        />
      </Chart>

      <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.03)' }}></div>
      <Chart>
        <Settings
          theme={{ colors: { vizColors: ['#2b8cbe'] } }}
          tooltip={{
            type: TooltipType.Follow,
            snap: false,
          }}
          debug={boolean('debug', false)}
          pointBuffer={(r) => 20 / r}
          xDomain={xDomain}
        />
        <Axis
          id="top"
          position={Position.Top}
          ticks={5}
          style={{
            tickLine: {
              size: 5,
              padding: 3,
            },
          }}
          gridLine={{
            visible: false,
            stroke: 'black',
          }}
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
            visible: false,
            stroke: 'black',
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
            visible: false,
            stroke: 'black',
          }}
          domain={yDomain}
        />

        <Axis
          id="right"
          position={Position.Right}
          ticks={5}
          tickFormat={(d) => `${d / 1000}`}
          style={{
            tickLine: {
              size: 5,
              padding: 3,
            },
          }}
          gridLine={{
            visible: false,
            stroke: 'black',
          }}
          domain={yDomain}
        />

        <BubbleSeries
          id="Sale price (k$)"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          tickFormat={(d) => `${Math.round(d / 1000)}`}
          bubbleSeriesStyle={{
            point: {
              shape: 'circle',
              fill: 'black',
              opacity: 1,
              radius: 1,
              strokeWidth: 0,
            },
          }}
          data={filteredData}
        />
      </Chart>
      <Chart>
        <Settings
          theme={{
            colors: { vizColors: ['#69707d'] },
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
          xDomain={Array.from({ length: buckets }, (d, i) => (i * xDomain.max) / buckets)}
        />
        <Axis id="x" position={Position.Bottom} tickFormat={(d) => `${d} - ${d + xDomain.max / buckets}`} hide />
        <BarSeries
          id="# of apartments"
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          minBarHeight={2}
          enableHistogramMode
          data={[
            ...filteredData
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
            colors: { vizColors: ['#69707d'] },
            chartMargins: {
              bottom: 48,
              left: 0,
              right: 0,
              top: 27,
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
          tickFormat={(d) => `${d / 1000}k$ - ${(d + yDomain.max / buckets) / 1000}k$`}
          style={{
            tickLine: {
              size: 5,
              padding: 3,
            },
            tickLabel: {
              visible: false,
            },
          }}
          ticks={5}
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
            ...filteredData
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
    id: 'heatmap',
    position: { left: 100 + 55, top: 179, width: 409, height: 408, angle: 0 },
  },
  {
    id: 'group_marginalScatter',
    group: true,
    position: { left: 100, top: 71, width: 580, height: 380, angle: 0, parent: null },
  },
  {
    id: 'bubbles',
    position: { left: 100, top: 150, width: 500, height: 485, angle: 0, parent: 'group_marginalScatter' },
  },
  {
    id: 'barsOnTop',
    position: { left: 100, top: 71, width: 500, height: 80, angle: 0, parent: 'group_marginalScatter' },
  },
  {
    id: 'barsOnSide',
    position: { left: 599, top: 150, width: 80, height: 485, angle: 0, parent: 'group_marginalScatter' },
  },
];

export const Example = () => {
  return <Canvas charts={charts(20)} chartDescriptors={chartDescriptors}></Canvas>;
};

Example.parameters = {
  background: { default: 'white' },
};
