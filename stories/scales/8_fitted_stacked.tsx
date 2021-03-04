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

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, AreaSeries, Position, ScaleType, StackMode } from '../../src';
import { SB_KNOBS_PANEL } from '../utils/storybook';

const data = [
  { x: 1614650400000, y1: 3935, y2: 6837 },
  { x: 1614675600000, y1: 2029, y2: 5588 },
  { x: 1614693600000, y1: 3239, y2: 9339 },
  { x: 1614695400000, y1: 2706, y2: 5883 },
  { x: 1614697200000, y1: 1698, y2: 7050 },
  { x: 1614699000000, y1: 2581, y2: 4334 },
  { x: 1614717000000, y1: 2574, y2: 2574 },
  { x: 1614726000000, y1: 7676, y2: 4676 },
];

export const Example = () => {
  const fit = boolean('fit y domain to data', true);
  const stacked = boolean('stacked', true);
  const stackMode =
    select<StackMode | undefined>(
      'stackMode',
      {
        Silhouette: StackMode.Silhouette,
        Wiggle: StackMode.Wiggle,
        None: undefined,
      },
      undefined,
    ) || undefined;
  const yScaleType = select(
    'Y scale type',
    {
      [ScaleType.Linear]: ScaleType.Linear,
      [ScaleType.Log]: ScaleType.Log,
    },
    ScaleType.Linear,
  );

  return (
    <Chart className="story-chart">
      <Axis id="count" position={Position.Left} domain={{ fit }} />
      <Axis id="x" position={Position.Bottom} />
      <AreaSeries
        id="bars"
        name="amount"
        stackMode={stackMode}
        xScaleType={ScaleType.Time}
        yScaleType={yScaleType}
        stackAccessors={stacked ? ['test'] : []}
        yAccessors={['y1', 'y2']}
        areaSeriesStyle={{ point: { visible: true } }}
        data={data}
      />
    </Chart>
  );
};

Example.story = {
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
    info: {
      text: `The default timezone is UTC. If you want to visualize data in UTC,
      but you are in a different timezone, remember to format the millis from \`tickFormat\`
      to UTC. In this Example be able to see the first value on \`2019-01-01  00:00:00.000 \``,
    },
  },
};
