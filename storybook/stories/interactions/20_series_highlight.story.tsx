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
  AreaSeries,
  Axis,
  BubbleSeries,
  Chart,
  CurveType,
  LegendValue,
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getKnobFromEnum } from '../utils/knobs/utils';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));
const rng = getRandomNumberGenerator();

const dataSeries = Array.from({ length: 50 }).map(() =>
  KIBANA_METRICS.metrics.kibana_os_load.v1.data.map((d) => {
    return [d[0], rng(0, 5) + d[1], rng(0, 10) + d[1]];
  }),
);

export const Example: ChartsStory = (_, { title, description }) => {
  const baseTheme = useBaseTheme();
  const chartType = getKnobFromEnum(
    'chart type',
    {
      area: 'area',
      line: 'line',
      bubble: 'bubble',
    },
    'area',
  );
  const showPoints = boolean('show points', false);
  const stacked = boolean('stacked', false);
  const dataPoints = number('data points', 50, {
    min: 1,
    max: KIBANA_METRICS.metrics.kibana_os_load.v1.data.length,
    step: 1,
    range: true,
  });
  const maxSeries = number('series', 20, {
    min: 1,
    max: 50,
    step: 1,
    range: true,
  });

  const ChartComponent = chartType === 'area' ? AreaSeries : chartType === 'line' ? LineSeries : BubbleSeries;
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={Position.Right}
        baseTheme={baseTheme}
        theme={{
          lineSeriesStyle: {
            point: {
              visible: showPoints ? 'always' : 'never',
            },
          },
          areaSeriesStyle: {
            point: {
              visible: showPoints ? 'always' : 'never',
            },
          },
        }}
      />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks tickFormat={dateFormatter} />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
        position={Position.Left}
        tickFormat={(d) => `${Number(d).toFixed(0)}%`}
      />

      {Array.from({ length: maxSeries }).map((d, i) => {
        return (
          <ChartComponent
            key={i}
            id={`${KIBANA_METRICS.metrics.kibana_os_load.v1.metric.label}-${i}`}
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            yAccessors={[1]}
            data={dataSeries[i].slice(0, dataPoints)}
            curve={CurveType.LINEAR}
            stackAccessors={stacked ? [0] : undefined}
            markSizeAccessor={chartType === 'bubble' ? 2 : undefined}
          />
        );
      })}
    </Chart>
  );
};
