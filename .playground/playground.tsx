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
import { SWIM_LANE_DATA } from '../src/utils/data_samples/test_anomaly_swim_lane';

export class Playground extends React.Component {
  render() {
    return (
      <div>
        <div className="chart" style={{ height: '600px' }}>
          <Chart>
            <Settings
              onElementClick={console.log}
              showLegend
              legendPosition="top"
              onBrushEnd={console.log}
              brushAxis="both"
              xDomain={{ min: 1572825600000, max: 1572912000000, minInterval: 1800000 }}
            />
            <Heatmap
              id="heatmap1"
              ranges={[0, 3, 25, 50, 75]}
              colorScale={ScaleType.Threshold}
              colors={['#ffffff', '#d2e9f7', '#8bc8fb', '#fdec25', '#fba740', '#fe5050']}
              data={SWIM_LANE_DATA.map((v) => ({ ...v, time: v.time * 1000 }))}
              // highlightedData={{ x: [], y: [] }}
              xAccessor={(d) => d.time}
              yAccessor={(d) => d.laneLabel}
              valueAccessor={(d) => d.value}
              valueFormatter={(d) => d.toFixed(0.2)}
              ySortPredicate="numAsc"
              xScaleType={ScaleType.Time}
              config={{
                grid: {
                  cellHeight: {
                    min: 20,
                    max: 'fill', // 'fill',
                  },
                  stroke: {
                    width: 1,
                    color: '#D3DAE6',
                  },
                },
                cell: {
                  maxWidth: 'fill',
                  maxHeight: 'fill',
                  label: {
                    visible: false,
                  },
                  border: {
                    stroke: '#D3DAE6',
                    strokeWidth: 0,
                  },
                },
                yAxisLabel: {
                  align: 'left',
                  visible: true,
                  maxWidth: 50,
                },
                xAxisLabel: {
                  maxWidth: 20,
                },
              }}
            />
          </Chart>
        </div>
        <br />
        <div className="chart" style={{ height: '500px' }}>
          <Chart>
            <Settings
              onElementClick={console.log}
              showLegend
              legendPosition="left"
              onBrushEnd={console.log}
              brushAxis="both"
            />
            <Heatmap
              id="heatmap2"
              colorScale={ScaleType.Linear}
              colors={['yellow', 'red']}
              data={BABYNAME_DATA.filter(([year]) => year > 1950)}
              xAccessor={(d) => d[2]}
              yAccessor={(d) => d[0]}
              valueAccessor={(d) => d[3]}
              valueFormatter={(value) => value.toFixed(0.2)}
              xSortPredicate="alphaAsc"
              config={{
                grid: {
                  cellHeight: {
                    min: 40,
                    max: 40, // 'fill',
                  },
                  stroke: {
                    width: 0,
                  },
                },
                cell: {
                  maxWidth: 'fill',
                  maxHeight: 20,
                  label: {
                    visible: true,
                  },
                  border: {
                    stroke: 'white',
                    strokeWidth: 1,
                  },
                },
                yAxisLabel: {
                  visible: true,
                  maxWidth: 200,
                },
              }}
            />
          </Chart>
        </div>
      </div>
    );
  }
}
