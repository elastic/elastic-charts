/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import {
  LineSeries,
  Axis,
  BarSeries,
  Chart,
  ScaleType,
  Settings,
  Position,
  HistogramBarSeries,
  niceTimeFormatter,
} from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator('chart');
const start = Date.parse('2023-07-01T00:00:00.000Z').valueOf();
const interval = 1000 * 60 * 5;
const data = Array.from({ length: 20 }, (d, i) => {
  return [start + interval * i, Math.floor(rng(2, 10))];
});

export const Example: ChartsStory = (_, { title, description }) => {
  const customDomain = boolean('custom domain', false);
  const startTimeSlider = number('start time', 0, { min: 0, max: 20, range: true, step: 0.2 });
  const rangeSlider = number('end time', 19, { min: 1, max: 25, range: true, step: 0.2 });
  const subtract = boolean('subtract 1ms', false);

  const tickFormat = (d: number) => new Date(d).toISOString();
  const xDomain = customDomain
    ? { min: start + interval * startTimeSlider, max: start + interval * rangeSlider - (subtract ? 1 : 0) }
    : undefined;
  const domain: [number, number] = [xDomain?.min ?? data[0][0] ?? 0, xDomain?.max ?? data.at(-1)?.[0] ?? 0];

  return (
    <>
      <p>
        {xDomain ? 'configured' : 'data'} domain: {new Date(domain[0]).toISOString()} to{' '}
        {new Date(domain[1]).toISOString()}
      </p>
      <Chart title={title} description={description} size={['100%', 250]}>
        <Settings
          baseTheme={useBaseTheme()}
          showLegend
          legendPosition={{
            floatingColumns: 1,
            floating: true,
            direction: 'vertical',
            hAlign: 'right',
            vAlign: 'top',
          }}
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
          id="Area"
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
          legendPosition={{
            floatingColumns: 1,
            floating: true,
            direction: 'vertical',
            hAlign: 'right',
            vAlign: 'top',
          }}
          showLegend
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
          id="Line"
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
          legendPosition={{
            floatingColumns: 1,
            floating: true,
            direction: 'vertical',
            hAlign: 'right',
            vAlign: 'top',
          }}
          showLegendExtra
          xDomain={xDomain}
          theme={{
            scales: {
              histogramPadding: 0,
              barsPadding: 0.2,
            },
          }}
        />
        <Axis
          id="x"
          position={Position.Bottom}
          gridLine={{ visible: true }}
          timeAxisLayerCount={2}
          style={{
            tickLabel: {
              alignment: { horizontal: 'center' },
              padding: 0,
            },
            tickLine: {
              padding: 0,
              size: 5,
            },
          }}
          tickFormat={(d) => niceTimeFormatter(domain)(d, { timeZone: 'UTC' })}
        />
        <Axis id="y" position={Position.Left} gridLine={{ visible: true }} />
        <BarSeries
          id="Categorical"
          xScaleType={ScaleType.Ordinal}
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
