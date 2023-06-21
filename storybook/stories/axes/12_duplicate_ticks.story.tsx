/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import moment from 'moment-timezone';
import React from 'react';

import {
  Axis,
  Chart,
  LineSeries,
  Position,
  ScaleType,
  niceTimeFormatter,
  TickFormatter,
  Settings,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const now = DateTime.fromISO('2019-01-11T00:00:00.000').setZone('utc+1').toMillis();
  const oneDay = moment.duration(1, 'd');
  const twoDays = moment.duration(2, 'd');
  const threeDays = moment.duration(3, 'd');
  const fourDays = moment.duration(4, 'd');
  const fiveDays = moment.duration(5, 'd');
  const formatters: Record<string, TickFormatter> = {
    daily: niceTimeFormatter([now, moment.duration(31, 'd').add(now).asMilliseconds()]),
    hourly: (d) => moment(d).format('HH:mm'),
  };
  const formatterSelect = select<string>('formatter', ['daily', 'hourly'], 'daily');
  const formatter = formatters[formatterSelect];

  const duplicateTicksInAxis = boolean('Show duplicate ticks in x axis', false);
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} tickFormat={formatter} showDuplicatedTicks={duplicateTicksInAxis} />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
        position={Position.Left}
        tickFormat={(d) => `${Number(d).toFixed(1)}`}
      />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: now, y: 2 },
          { x: oneDay.add(now).asMilliseconds(), y: 3 },
          { x: twoDays.add(now).asMilliseconds(), y: 3 },
          { x: threeDays.add(now).asMilliseconds(), y: 4 },
          { x: fourDays.add(now).asMilliseconds(), y: 8 },
          { x: fiveDays.add(now).asMilliseconds(), y: 6 },
        ]}
        timeZone="local"
      />
    </Chart>
  );
};
