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

import { Chart, BarSeries, Axis, Position, ScaleType } from '../src';

export class Playground extends React.Component {
  render() {
    return (
      <div className="testing">
        <div className="chart">
          <Chart>
            <Axis
              id="y"
              position={Position.Left}
              domain={{ fit: true }}
            />
            <BarSeries
              id="spec1"
              yAccessors={['y1']}
              splitSeriesAccessors={['g']}
              stackAccessors={['x']}
              xScaleType={ScaleType.Linear}
              data={[
                { x: 1, y1: 1, g: 'a' },
                { x: 2, y1: 2, g: 'a' },
                { x: 4, y1: 4, g: 'a' },
                { x: 1, y1: 21, g: 'b' },
                { x: 3, y1: 23, g: 'b' },
              ]}
            />
          </Chart>
        </div>
      </div>
    );
  }
}
