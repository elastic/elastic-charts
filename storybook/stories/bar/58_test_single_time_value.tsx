/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import moment from 'moment';
import React from 'react';

import { BarSeries, Chart, ScaleType, Settings, Position, Axis } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const start = moment(1628571600000);
  const useInterval = boolean('use minInterval', false);
  const minInterval = number('minInterval', 1, { min: 1, max: 8 });
  const range = number('range', 8, { min: 1 });
  const unit = select('unit of time', ['year', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'], 'day');

  return (
    <Chart>
      <Settings
        baseTheme={useBaseTheme()}
        xDomain={{
          min: start
            .clone()
            .subtract(range / 2, unit)
            .valueOf(),
          max: start
            .clone()
            .add(range / 2, unit)
            .valueOf(),
          minInterval: useInterval ? moment.duration(minInterval, unit).asMilliseconds() : undefined,
        }}
      />
      <Axis id="x" position={Position.Bottom} tickFormat={(d) => moment(d).format('lll')} />
      <Axis id="y" position={Position.Left} />

      <BarSeries
        id="bars"
        xAccessor={0}
        yAccessors={[1]}
        timeZone="local"
        enableHistogramMode
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        data={[[start.valueOf(), 10]]}
      />
    </Chart>
  );
};
