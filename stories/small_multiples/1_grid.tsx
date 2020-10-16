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
import React from 'react';

import { ScaleType, Position, Chart, Axis, LineSeries, GroupBy, SmallMultiples } from '../../src';
import { DataGenerator } from '../../src/utils/data_generators/data_generator';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const dg = new DataGenerator();

export const Example = () => {
  const data1 = dg.generateGroupedSeries(50, 3);
  const data2 = dg.generateGroupedSeries(50, 3);
  const data3 = dg.generateGroupedSeries(50, 3);
  return (
    <Chart className="story-chart">
      <Axis id="time" position={Position.Bottom} showGridLines />
      <Axis id="y" position={Position.Left} showGridLines />

      <GroupBy
        id="vertical_split"
        by={({ id }) => {
          return [id];
        }}
        sort={['alphaAsc']}
      />
      <GroupBy
        id="horizontal_split"
        by={(spec, { g }: any) => {
          return [g];
        }}
        sort={['alphaAsc']}
      />
      <SmallMultiples splitVertically="vertical_split" splitHorizontally="horizontal_split" />
      <LineSeries
        id="lines1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        timeZone="local"
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={data1}
      />
      <LineSeries
        id="lines2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        timeZone="local"
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={data2}
      />
      <LineSeries
        id="lines3"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        timeZone="local"
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={data3}
      />
    </Chart>
  );
};
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
    info: {
      text: `If your data is in UTC timezone, your tooltip and axis labels can be configured
      to visualize the time translated to your local timezone. You should be able to see the
      first value on \`2019-01-01  01:00:00.000 \``,
    },
  },
};
