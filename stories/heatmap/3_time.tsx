/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';

import { Chart, Heatmap, RecursivePartial, ScaleType, Settings } from '../../packages/charts/src';
import { Config } from '../../packages/charts/src/chart_types/heatmap/layout/types/config_types';
import { getRandomNumberGenerator } from '../../packages/charts/src/mocks/utils';

const rng = getRandomNumberGenerator();
const start = DateTime.fromISO('2021-03-27T20:00:00', { zone: 'CET' });
const end = DateTime.fromISO('2021-03-28T11:00:00', { zone: 'CET' });
const data = [...new Array(14)].flatMap((d, i) => {
  return [
    [start.plus({ hour: i }).toMillis(), 'cat A', rng(0, 10)],
    [start.plus({ hour: i }).toMillis(), 'cat B', rng(0, 10)],
    [start.plus({ hour: i }).toMillis(), 'cat C', rng(0, 10)],
    [start.plus({ hour: i }).toMillis(), 'cat D', rng(0, 10)],
    [start.plus({ hour: i }).toMillis(), 'cat E', rng(0, 10)],
  ];
});

export const Example = () => {
  const config: RecursivePartial<Config> = useMemo(
    () => ({
      grid: {
        cellHeight: {
          min: 20,
        },
        stroke: {
          width: 0,
          color: '#D3DAE6',
        },
      },
      cell: {
        maxWidth: 'fill',
        maxHeight: 3,
        label: {
          visible: false,
        },
        border: {
          stroke: 'transparent',
          strokeWidth: 0,
        },
      },
      yAxisLabel: {
        visible: true,
        width: 'auto',
        padding: { left: 10, right: 10 },
      },
      xAxisLabel: {
        formatter: (value: string | number) => {
          return DateTime.fromMillis(value as number).toFormat('HH:mm:ss', { timeZone: 'UTC' });
        },
      },
    }),
    [],
  );

  const startTimeOffset = number('start time offset', 0, {
    min: -1000 * 60 * 60 * 24,
    max: 1000 * 60 * 60 * 10,
    step: 1000,
    range: true,
  });
  const endTimeOffset = number('end time offset', 0, {
    min: -1000 * 60 * 60 * 10,
    max: 1000 * 60 * 60 * 24,
    step: 1000,
    range: true,
  });

  return (
    <>
      {/* <div style={{ fontFamily: 'monospace', fontSize: 10, paddingBottom: 5 }}> */}
      {/*  {DateTime.fromMillis(start.toMillis() + startTimeOffset).toISO()} to{' '} */}
      {/*  {DateTime.fromMillis(end.toMillis() + endTimeOffset).toISO()} */}
      {/* </div> */}
      <Chart className="story-chart">
        <Settings
          xDomain={{
            min: start.toMillis() + startTimeOffset,
            max: end.toMillis() + endTimeOffset,
            minInterval: 1000 * 60 * 60,
          }}
        />
        <Heatmap
          id="heatmap1"
          colorScale={ScaleType.Linear}
          colors={['white', 'blue']}
          data={data}
          xAccessor={(d) => d[0]}
          yAccessor={(d) => d[1]}
          valueAccessor={(d) => d[2]}
          valueFormatter={(d) => d.toFixed(2)}
          ySortPredicate="numAsc"
          xScaleType={ScaleType.Time}
          config={config}
        />
      </Chart>
    </>
  );
};
