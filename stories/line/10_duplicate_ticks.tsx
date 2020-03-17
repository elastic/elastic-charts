/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import React from 'react';
import { Axis, Chart, LineSeries, Position, ScaleType, niceTimeFormatter } from '../../src/';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';
import { boolean } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import moment from 'moment-timezone';

export const example = () => {
  const now = DateTime.fromISO('2019-01-11T00:00:00.000')
    .setZone('utc+1')
    .toMillis();
  const oneDay = moment.duration(1, 'day');
  const formatter = niceTimeFormatter([now, oneDay.add(now).asMilliseconds() * 31]);
  const duplicateTicksInAxis = boolean('Show duplicate ticks in x axis', false);
  return (
    <Chart className="story-chart">
      <Axis
        id="bottom"
        position={Position.Bottom}
        tickFormat={formatter}
        enableDuplicatedTicks={duplicateTicksInAxis}
      />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
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
          { x: oneDay.add(now).asMilliseconds() * 2, y: 3 },
          { x: oneDay.add(now).asMilliseconds() * 3, y: 4 },
          { x: oneDay.add(now).asMilliseconds() * 4, y: 8 },
          { x: oneDay.add(now).asMilliseconds() * 5, y: 6 },
        ]}
        timeZone="local"
      />
    </Chart>
  );
};
