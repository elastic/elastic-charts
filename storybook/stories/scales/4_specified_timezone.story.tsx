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

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings baseTheme={useBaseTheme()} />
    <Axis
      id="time"
      position={Position.Bottom}
      tickFormat={(d) => DateTime.fromMillis(d, { zone: 'Etc/GMT+6' }).toISO()}
    />
    <Axis id="y" position={Position.Left} />
    <LineSeries
      id="lines"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={1}
      yAccessors={[2]}
      timeZone="Etc/GMT+6"
      data={[
        ['2014-01-01T00:00:00.000-06:00', 1388556000000, 6206],
        ['2015-01-01T00:00:00.000-06:00', 1420092000000, 5674],
        ['2016-01-01T00:00:00.000-06:00', 1451628000000, 4148],
        ['2017-01-01T00:00:00.000-06:00', 1483250400000, 6206],
        ['2018-01-01T00:00:00.000-06:00', 1514786400000, 3698],
      ]}
    />
  </Chart>
);

Example.parameters = {
  markdown: `You can visualize data in a different timezone than your local or UTC zones.
      Specify the \`timeZone={'Etc/GMT+6'}\` property with the correct timezone and
      remember to apply the same timezone also to each formatted tick in \`tickFormat\``,
};
