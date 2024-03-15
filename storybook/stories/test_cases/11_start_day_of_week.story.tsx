/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number, select } from '@storybook/addon-knobs';
import moment from 'moment';
import React from 'react';

import { Chart, Axis, BarSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';

const rng = getRandomNumberGenerator('chart');

const dayMapping = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const startDow = number('start dow', 0, { min: 0, max: 6, step: 1 });
  const dataCount = number('data count', 20, { min: 0, step: 1 });
  const dataIntervalAmount = number('data interval (amount)', 1, { min: 1, step: 1 });
  const dataIntervaUnit = select<moment.unitOfTime.Base>(
    'data interval (unit)',
    ['minute', 'hour', 'day', 'week', 'month', 'year'],
    'week',
  );

  moment.updateLocale(moment.locale(), { week: { dow: startDow } });

  const data: { x: number; y: number }[] = [];
  const start = moment().startOf('w');

  for (let i = 0; i < dataCount; i++) {
    data.push({
      x: start
        .clone()
        .add(dataIntervalAmount * i, dataIntervaUnit)
        .valueOf(),
      y: rng(10, 100),
    });
  }

  return (
    <>
      <Chart title={title} description={description}>
        <Settings />
        <Axis id="y" title="Count" position={Position.Left} />
        <Axis
          id="x"
          title="Time"
          position={Position.Bottom}
          timeAxisLayerCount={3}
          tickFormat={(d) => moment(d).format('llll')}
          style={{
            tickLine: { visible: true, padding: 4 },
            tickLabel: {
              alignment: {
                horizontal: Position.Left,
                vertical: Position.Bottom,
              },
              padding: 0,
              offset: { x: 0, y: 0 },
            },
          }}
        />
        <BarSeries
          enableHistogramMode
          id="bars"
          name="amount"
          xScaleType={ScaleType.Time}
          xAccessor="x"
          yAccessors={['y']}
          data={data}
        />
      </Chart>
      <span style={{ padding: 10 }}>
        <b>dow:</b> {startDow}
        {/* @ts-ignore - mapping constrained */}
        &nbsp;({dayMapping[startDow]!})
      </span>
      <span style={{ padding: 10 }}>
        <b>Start:</b> {start.format('llll')}
      </span>
    </>
  );
};
