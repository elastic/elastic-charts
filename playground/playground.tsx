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

import { Chart, LineSeries, BarSeries, AreaSeries } from '../src';

export class Playground extends React.Component {
  render() {
    return (
      <div className="App">
        <Chart size={[500, 200]}>
          <LineSeries
            id="lines2"
            name="lines"
            showNullValuesInTooltip
            data={[
              { x: 0, y: 300, val: 1232 },
              { x: 1, y: 20, val: 1232 },
              { x: 2, y: null, val: 1232 },
              { x: 3, y: 804, val: 1232 },
            ]}
          />
          <AreaSeries
            showNullValuesInTooltip
            id="area"
            name="area"
            data={[
              { x: 0, y: null, val: 1232 },
              { x: 1, y: null, val: 1232 },
              { x: 2, y: null, val: 1232 },
              { x: 3, y: 804, val: 1232 },
            ]}
          />
          <BarSeries
            id="bars"
            showNullValuesInTooltip
            name="bars"
            yAccessors={['y']}
            data={[
              { x: 0, y: 390, val: 1222 },
              { x: 1, y: null, val: 1222 },
              { x: 2, y: 750, val: 1222 },
              { x: 3, y: null, val: 1222 },
            ]}
          />
        </Chart>
      </div>
    );
  }
}
