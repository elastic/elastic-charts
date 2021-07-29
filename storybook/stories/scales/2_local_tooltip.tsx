/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DateTime } from 'luxon';
import React from 'react';

import { Axis, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const UTC_DATE = DateTime.fromISO('2019-01-01T00:00:00.000Z').toMillis();
const DAY_INCREMENT_1 = 1000 * 60 * 60 * 24;
const UTC_DATASET = new Array(10).fill(0).map((d, i) => [UTC_DATE + DAY_INCREMENT_1 * i, i % 5]);

export const Example = () => (
  <Chart>
    <Settings baseTheme={useBaseTheme()} />
    <Axis
      id="time"
      position={Position.Bottom}
      tickFormat={(d) => DateTime.fromMillis(d).toFormat('yyyy-MM-dd HH:mm:ss')}
    />
    <Axis id="y" position={Position.Left} />
    <LineSeries
      id="lines"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      timeZone="local"
      xAccessor={0}
      yAccessors={[1]}
      data={UTC_DATASET}
    />
  </Chart>
);

Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
  markdown: `If your data is in UTC timezone, your tooltip and axis labels can be configured
      to visualize the time translated to your local timezone. You should be able to see the
      first value on \`2019-01-01  01:00:00.000 \``,
};
