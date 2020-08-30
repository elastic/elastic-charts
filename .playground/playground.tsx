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
/* eslint-disable no-console */
import React from 'react';

import { Chart, Heatmap, ScaleType, Settings } from '../src';
import { BABYNAME_DATA } from '../src/utils/data_samples/babynames';

export class Playground extends React.Component {
  render() {
    return (
      <div className="chart">
        <Chart>
          <Settings onElementClick={console.log} showLegend legendPosition="top" />
          <Heatmap
            id="heatmap"
            ranges={[0, 1000]}
            colorScale={ScaleType.Quantize}
            colors={['green', 'yellow', 'red']}
            data={BABYNAME_DATA.filter(([year]) => year > 1950)}
            xAccessor={(d) => d[2]}
            yAccessor={(d) => d[0]}
            valueAccessor={(d) => d[3]}
            valueFormatter={(value) => value.toFixed(0.2)}
            xSortPredicate="alphaAsc"
            config={{
              grid: {
                cellHeight: {
                  max: 30, // 'fill',
                },
              },
              cell: {
                maxWidth: 'fill',
                maxHeight: 'fill',
                label: {
                  visible: true,
                },
                border: {
                  stroke: 'white',
                  strokeWidth: 0.5,
                },
              },
            }}
          />
        </Chart>
      </div>
    );
  }
}
