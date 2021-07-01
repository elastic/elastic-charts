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

import { Axis, Chart, BubbleSeries, Settings, Position } from '../packages/charts/src';

export class Playground extends React.Component {
  render() {
    return (
      <div className="App">
        <Chart size={[500, 500]}>
          <Settings ariaLabel="This is a custom aria-label" ariaLabelledBy="labeled by here" showLegend />
          <Axis id="horizontal" position={Position.Bottom} />
          <Axis id="vertical" position={Position.Left} />
          <BubbleSeries
            id="bubble1"
            name="test1"
            bubbleSeriesStyle={{ point: { shape: 'diamond' } }}
            data={[
              { x: 0, y: 350 },
              { x: 1, y: 201 },
              { x: 2, y: 550 },
              { x: 3, y: 604 },
            ]}
          />
          <BubbleSeries
            id="bubble2"
            name="test2"
            bubbleSeriesStyle={{ point: { shape: 'plus' } }}
            data={[
              { x: 0, y: 300 },
              { x: 1, y: 20 },
              { x: 2, y: 700 },
              { x: 3, y: 804 },
            ]}
          />
          <BubbleSeries
            id="bubble3"
            name="test3"
            bubbleSeriesStyle={{ point: { shape: 'triangle' } }}
            data={[
              { x: 0, y: 390 },
              { x: 1, y: 123 },
              { x: 2, y: 750 },
              { x: 3, y: 854 },
            ]}
          />
        </Chart>
      </div>
    );
  }
}
