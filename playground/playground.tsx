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

import { Chart, AreaSeries, LineSeries, BarSeries, ScaleType, Settings, Heatmap } from '../packages/charts/src';

export class Playground extends React.Component {
  render() {
    return (
      <div className="App">
        <Chart size={[500, 200]}>
          <Settings onBrushEnd={console.log} brushAxis="both" />
          <Heatmap
            xScaleType={ScaleType.Ordinal}
            data={DATA}
            id="111"
            xAccessor={'6236f697-f919-4d1b-a697-01c5cce7b81b'}
            yAccessor={'79b13663-d722-4554-8746-b35c4a266673'}
            valueAccessor={'b6dcf411-56af-4df5-b572-17602e2825f5'}
            config={{
              brushTool: {
                visible: true,
              },
              onBrushEnd: console.log,
            }}
          />
        </Chart>
      </div>
    );
  }
}

const DATA = [
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Shoes",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 210,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 333,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Shoes",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 44,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 298,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Shoes",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 165,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 215,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Shoes",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': '__other__',
    'b6dcf411-56af-4df5-b572-17602e2825f5': 89,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Shoes",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 150,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 343,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Shoes",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 165,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 215,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Shoes",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 110,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 205,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Shoes",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': '__other__',
    'b6dcf411-56af-4df5-b572-17602e2825f5': 83.33333333333333,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Accessories",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 210,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 333,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Accessories",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 155,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 317,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Accessories",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 110,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 193,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Accessories",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': '__other__',
    'b6dcf411-56af-4df5-b572-17602e2825f5': 65,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Clothing",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 210,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 277.5,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Clothing",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 165,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 248,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Clothing",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 200,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 225,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Men's Clothing",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': '__other__',
    'b6dcf411-56af-4df5-b572-17602e2825f5': 64.125,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Accessories",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 150,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 343,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Accessories",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 200,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 225,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Accessories",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 115,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 144,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Accessories",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': '__other__',
    'b6dcf411-56af-4df5-b572-17602e2825f5': 61.46875,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Clothing",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 150,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 343,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Clothing",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 165,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 215,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Clothing",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': 80,
    'b6dcf411-56af-4df5-b572-17602e2825f5': 210.5,
  },
  {
    '79b13663-d722-4554-8746-b35c4a266673': "Women's Clothing",
    '6236f697-f919-4d1b-a697-01c5cce7b81b': '__other__',
    'b6dcf411-56af-4df5-b572-17602e2825f5': 57.96527777777778,
  },
];
