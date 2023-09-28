/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { LineSeries, Axis, BarSeries, Chart, ScaleType, Settings, Position, HistogramBarSeries } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator('chart');
const start = Date.parse('2023-07-01T00:00:00.000Z').valueOf();
const interval = 1000 * 60 * 5;
const data = Array.from({ length: 20 }, (d, i) => {
  return [start + interval * i, Math.floor(rng(2, 10))];
});
console.log(
  data
    .map((d) => [`"${new Date(d[0]).toISOString()}"`, d[1]])
    .map((d) => d.join(','))
    .join('\n'),
);
export const Example: ChartsStory = (_, { title, description }) => {
  const customDomain = boolean('custom domain', false);
  const rangeSlider = number('time range', 19, { min: 1, max: 25, range: true, step: 0.2 });
  const subtract = boolean('subtract 1ms', false);

  const tickFormat = (d: number) => new Date(d).toISOString();
  const xDomain = customDomain ? { min: start, max: start + interval * rangeSlider - (subtract ? 1 : 0) } : undefined;

  return (
    <>
      <p>
        {xDomain ? 'configured' : 'data'} domain: {new Date(xDomain ? xDomain.min : data[0][0]).toISOString()} to{' '}
        {new Date(xDomain ? xDomain.max : data.at(-1)?.[0] ?? start).toISOString()}
      </p>
      <Chart title={title} description={description} size={['100%', 250]}>
        <Settings
          baseTheme={useBaseTheme()}
          showLegend
          legendPosition={Position.Bottom}
          showLegendExtra
          xDomain={xDomain}
          theme={{
            scales: {
              histogramPadding: 0,
              barsPadding: 0,
            },
            barSeriesStyle: {
              rectBorder: {
                visible: true,
                strokeWidth: 0,
                stroke: 'white',
              },
            },
          }}
        />
        <Axis
          id="x"
          tickFormat={tickFormat}
          position={Position.Bottom}
          gridLine={{ visible: true }}
          timeAxisLayerCount={2}
          style={{
            tickLabel: {
              alignment: { horizontal: 'left' },
              padding: 0,
            },
            tickLine: {
              padding: 0,
              size: 5,
            },
          }}
        />
        <Axis id="y" position={Position.Left} gridLine={{ visible: true }} />
        <HistogramBarSeries
          id="area"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data}
          histogramInterval={{
            type: 'fixed',
            unit: 'm',
            value: 5,
          }}
          timeZone="UTC"
          color="#FF6666"
        />
      </Chart>
      <Chart title={title} description={description} size={['100%', 250]}>
        <Settings
          baseTheme={useBaseTheme()}
          showLegend
          legendPosition={Position.Bottom}
          showLegendExtra
          xDomain={xDomain}
          theme={{
            scales: {
              histogramPadding: 0,
              barsPadding: 0,
            },
          }}
        />
        <Axis
          id="x"
          tickFormat={tickFormat}
          position={Position.Bottom}
          gridLine={{ visible: true }}
          timeAxisLayerCount={2}
          style={{
            tickLabel: {
              alignment: { horizontal: 'left' },
              padding: 0,
            },
            tickLine: {
              padding: 0,
              size: 5,
            },
          }}
        />
        <Axis id="y" position={Position.Left} gridLine={{ visible: true }} />
        <LineSeries
          id="area"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data}
          timeZone="UTC"
        />
      </Chart>
      <Chart title={title} description={description} size={['100%', 250]}>
        <Settings
          baseTheme={useBaseTheme()}
          showLegend
          legendPosition={Position.Bottom}
          showLegendExtra
          xDomain={xDomain}
          theme={{
            scales: {
              histogramPadding: 0,
              barsPadding: 0,
            },
          }}
        />
        <Axis
          id="x"
          tickFormat={tickFormat}
          position={Position.Bottom}
          gridLine={{ visible: true }}
          timeAxisLayerCount={2}
          style={{
            tickLabel: {
              alignment: { horizontal: 'left' },
              padding: 0,
            },
            tickLine: {
              padding: 0,
              size: 5,
            },
          }}
        />
        <Axis id="y" position={Position.Left} gridLine={{ visible: true }} />
        <BarSeries
          id="area"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data}
          timeZone="UTC"
        />
      </Chart>
    </>
  );
};
