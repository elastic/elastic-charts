/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import * as moment from 'moment-timezone';
import React from 'react';

import {
  Axis,
  BarSeries,
  BrushEndListener,
  Chart,
  LineSeries,
  niceTimeFormatter,
  Position,
  ScaleType,
  Settings,
  TickFormatter,
} from '@elastic/charts';

import { isHorizontalRotation } from '../../../packages/charts/src/chart_types/xy_chart/state/utils/common';
import { useBaseTheme } from '../../use_base_theme';
import { getChartRotationKnob } from '../utils/knobs';

export const Example = () => {
  const now = DateTime.fromISO('2019-01-11T00:00:00.000').setZone('utc+1').toMillis();
  const oneDay = 1000 * 60 * 60 * 24;
  const oneDays = moment.duration(1, 'd');
  const twoDays = moment.duration(2, 'd');
  const fiveDays = moment.duration(5, 'd');
  const xFormatter = niceTimeFormatter([now, fiveDays.add(now).asMilliseconds()]);
  const brushEndListener: BrushEndListener = ({ x }) => {
    if (!x) {
      return;
    }
    action('onBrushEnd')(xFormatter(x[0]), xFormatter(x[1]));
  };
  const yFormatter: TickFormatter = (d) => Number(d).toFixed(2);
  const rotation = getChartRotationKnob();
  return (
    <Chart>
      <Settings
        baseTheme={useBaseTheme()}
        debug={boolean('debug', false)}
        onBrushEnd={brushEndListener}
        onElementClick={action('onElementClick')}
        rotation={rotation}
      />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="bottom"
        tickFormat={isHorizontalRotation(rotation) ? xFormatter : yFormatter}
      />
      <Axis
        id="left"
        title="left"
        position={Position.Left}
        tickFormat={isHorizontalRotation(rotation) ? yFormatter : xFormatter}
      />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        timeZone="Europe/Rome"
        data={[
          { x: now, y: 2 },
          { x: oneDays.add(now).asMilliseconds(), y: 7 },
          { x: twoDays.add(now).asMilliseconds(), y: 3 },
          { x: now + oneDay * 5, y: 6 },
        ]}
      />
      <LineSeries
        id="baras"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        timeZone="Europe/Rome"
        data={[
          { x: now, y: 2 },
          { x: now + oneDay, y: 7 },
          { x: now + oneDay * 2, y: 3 },
          { x: now + oneDay * 5, y: 6 },
        ]}
      />
    </Chart>
  );
};
