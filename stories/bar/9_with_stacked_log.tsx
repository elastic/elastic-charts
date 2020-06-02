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

import { Axis, BarSeries, Chart, Position, ScaleType } from '../../src';
import { SB_SOURCE_PANEL } from '../utils/storybook';

export const Example = () => (
  <Chart className="story-chart">
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

    <BarSeries
      id="bars"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Log}
      xAccessor="x"
      yAccessors={['y']}
      splitSeriesAccessors={['g']}
      stackAccessors={['x']}
      data={[
        { x: 1, y: 0, g: 'a' },
        { x: 1, y: 0, g: 'b' },
        { x: 2, y: 1, g: 'a' },
        { x: 2, y: 1, g: 'b' },
        { x: 3, y: 2, g: 'a' },
        { x: 3, y: 2, g: 'b' },
        { x: 4, y: 3, g: 'a' },
        { x: 4, y: 0, g: 'b' },
        { x: 5, y: 4, g: 'a' },
        { x: 5, y: 0.5, g: 'b' },
        { x: 6, y: 5, g: 'a' },
        { x: 6, y: 1, g: 'b' },
        { x: 7, y: 6, g: 'b' },
        { x: 8, y: 7, g: 'a' },
        { x: 8, y: 10, g: 'b' },
        { x: 9, y: 4, g: 'a' },
      ]}
      yScaleToDataExtent
    />
  </Chart>
);

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
