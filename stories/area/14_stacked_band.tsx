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
 * under the License.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, timeFormatter } from '../../src';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';

const dateFormatter = timeFormatter('HH:mm');

export const Example = () => {
  const { data } = KIBANA_METRICS.metrics.kibana_os_load[0];
  const data2 = KIBANA_METRICS.metrics.kibana_os_load[0].data.map((d) => [d[0], 20, 10]);
  const fit = boolean('fit Y domain', false);

  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra />
      <Axis
        id="bottom"
        title="timestamp per 1 minute"
        position={Position.Bottom}
        showOverlappingTicks
        tickFormat={dateFormatter}
      />
      <Axis
        id="left"
        domain={{ fit }}
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />

      <AreaSeries
        id="area"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        y0Accessors={[2]}
        data={data}
        stackAccessors={[0]}
      />

      <AreaSeries
        id="fixed band"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        y0Accessors={[2]}
        data={data2}
        stackAccessors={[0]}
      />
    </Chart>
  );
};
