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

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Axis, Position, AreaSeries, ScaleType, LogBase } from '../../src';
import { logFormatter } from '../utils/formatters';

/**
 * Should filter out zero values when fitting domain
 */
export const Example = () => {
  const fit = boolean('fit', true);
  const logMinLimit = number('logMinLimit', 0.001);
  return (
    <Chart className="story-chart">
      <Axis
        id="count"
        position={Position.Left}
        domain={{ fit, logMinLimit }}
        tickFormat={logFormatter(LogBase.Common)}
      />
      <Axis id="x" position={Position.Bottom} />
      <AreaSeries
        id="bars"
        name="amount"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Log}
        areaSeriesStyle={{ point: { visible: true } }}
        data={[
          { x: 'a', y: 100 },
          { x: 'b', y: 0 },
          { x: 'c', y: 10 },
          { x: 'd', y: 0 },
          { x: 'e', y: 1 },
          { x: 'f', y: 0 },
          { x: 'g', y: 0.01 },
          { x: 'h', y: 0 },
        ]}
      />
    </Chart>
  );
};
