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

import { Chart, Settings, Axis, Position, BarSeries, ScaleType } from '../src';

export class Playground extends React.Component {
  render() {
    return (
      <div className="story-chart story-root root">
        <Chart size={[500, 200]}>
          <Settings
            dataTable={{
              showDefaultDescription: true,
              HeadingLevel: 'h1',
              description: 'This is a test playground used to see if your code is working as you expect it to',
            }}
          />
          <Axis id="count" title="count" position={Position.Left} />
          <Axis id="x" title="goods" position={Position.Bottom} />
          <BarSeries
            id="bar"
            name="short"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            xAccessor="x"
            yAccessors={['y']}
            data={[
              { x: 0, y: 3 },
              { x: 1, y: 5 },
              { x: 2, y: 7 },
            ]}
          />
        </Chart>
      </div>
    );
  }
}
