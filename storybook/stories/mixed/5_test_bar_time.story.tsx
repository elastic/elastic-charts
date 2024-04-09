/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DateTime } from 'luxon';
import React from 'react';

import { Axis, BarSeries, Chart, LegendValue, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { timeFormatter } from '@elastic/charts/src/utils/data/formatters';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const start = DateTime.fromISO('2019-01-01T00:00:00.000', { zone: 'utc' });
  const data1 = [
    [start.toMillis(), 1, 4],
    [start.plus({ minute: 1 }).toMillis(), 2, 5],
    [start.plus({ minute: 2 }).toMillis(), 3, 6],
    [start.plus({ minute: 3 }).toMillis(), 4, 7],
    [start.plus({ minute: 4 }).toMillis(), 5, 8],
    [start.plus({ minute: 5 }).toMillis(), 4, 7],
    [start.plus({ minute: 6 }).toMillis(), 3, 6],
    [start.plus({ minute: 7 }).toMillis(), 2, 5],
    [start.plus({ minute: 8 }).toMillis(), 1, 4],
  ];
  const data2 = [
    [start.toMillis(), 1, 4],
    [start.plus({ minute: 1 }).toMillis(), 2, 5],
    [start.plus({ minute: 2 }).toMillis(), 3, 6],
    [start.plus({ minute: 3 }).toMillis(), 4, 7],
    [start.plus({ minute: 4 }).toMillis(), 5, 8],
    [start.plus({ minute: 5 }).toMillis(), 4, 7],
    [start.plus({ minute: 6 }).toMillis(), 3, 6],
    [start.plus({ minute: 7 }).toMillis(), 2, 5],
    [start.plus({ minute: 8 }).toMillis(), 1, 4],
  ];
  const dateFormatter = timeFormatter('HH:mm:ss');

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={Position.Right}
        baseTheme={useBaseTheme()}
      />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="Bottom axis"
        showOverlappingTicks
        tickFormat={dateFormatter}
      />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="data1"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data1}
      />
      <LineSeries
        id="data2"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[2]}
        data={data2}
      />
    </Chart>
  );
};
