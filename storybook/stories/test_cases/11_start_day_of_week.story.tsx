/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number, select, date } from '@storybook/addon-knobs';
import moment from 'moment';
import React from 'react';

import { Chart, Axis, BarSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';

const rng = getRandomNumberGenerator('chart');
const randomValues = Array.from({ length: 1000 }).map(() => rng(10, 100));

const dayMapping = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const startDate = date('start date', moment(1710796632334).toDate());
  const startDow = number('start dow', 1, { min: 1, max: 7, step: 1 });
  const dataCount = number('data count', 18, { min: 0, step: 1 });
  const dataIntervalAmount = number('data interval (amount)', 1, { min: 1, step: 1 });
  const dataIntervaUnit = select<moment.unitOfTime.Base>(
    'data interval (unit)',
    ['minute', 'hour', 'day', 'week', 'month', 'year'],
    'week',
  );

  moment.updateLocale(moment.locale(), { week: { dow: startDow } });

  const data: { x: number; y: number }[] = [];
  const start = moment(startDate).startOf('w');

  for (let i = 0; i < dataCount; i++) {
    data.push({
      x: start
        .clone()
        .add(dataIntervalAmount * i, dataIntervaUnit)
        .valueOf(),
      y: randomValues[i],
    });
  }

  return (
    <>
      <Chart title={title} description={description}>
        <Settings dow={startDow} />
        <Axis id="y" title="Count" position={Position.Left} />
        <Axis
          id="x"
          title="Time"
          position={Position.Bottom}
          tickFormat={(d) => moment(d).format('llll')}
          style={{
            tickLine: { visible: true, padding: 0 },
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

Example.parameters = {
  markdown: `You can set the start day of week on the multilayer time axis by using using the \`Settings.dow\` option.
  This expects a value between \`1\` (Monday) and \`7\` (Sunday) according to the [**ISO 8601**](https://en.wikipedia.org/wiki/ISO_week_date) specification.`,
};
