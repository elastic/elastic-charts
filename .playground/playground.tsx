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

import { Axis, BarSeries, Chart, RectAnnotation, ScaleType, Settings } from '../src';
import { Position } from '../src/utils/commons';

export class Playground extends React.Component {
  render() {
    return (
      <div className="chart">
        <Chart className="story-chart">
          <RectAnnotation
            id="rect"
            dataValues={[
              {
                coordinates: {
                  x0: 2,
                  x1: 4,
                },
                details: 'Max anomaly score: 7',
              },
              {
                coordinates: {
                  x0: 12,
                  x1: 16,
                  // y0: 1,
                  // y1: 2,
                },
                details: 'Max anomaly score: 8',
              },
            ]}
            style={{ fill: 'red' }}
          />
          <Settings />
          <Axis id="bottom" position={Position.Bottom} title="x-domain axis" />
          <Axis
            domain={{ constrainPadding: false, fit: true }}
            id="left"
            title="y-domain axis"
            position={Position.Left}
          />
          <BarSeries
            id="bars"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            xAccessor="x"
            yAccessors={['y']}
            data={[
              { x: 0, y: 0 },
              { x: 5, y: 0 },
              { x: 20, y: 0 },
            ]}
          />
        </Chart>
      </div>
    );
  }
}
