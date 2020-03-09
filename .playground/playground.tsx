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
 * under the License. */

import React from 'react';
import {
  Chart,
  ScaleType,
  Position,
  Axis,
  Settings,
  PartitionElementEvent,
  XYChartElementEvent,
  Partition,
  BarSeries,
} from '../src';

type PieDatum = [string, number, string, number];
const pieData: Array<PieDatum> = [
  ['CN', 301, 'CN', 64],
  ['CN', 301, 'IN', 44],
  ['CN', 301, 'US', 24],
  ['CN', 301, 'ID', 13],
  ['CN', 301, 'BR', 8],
  ['IN', 245, 'IN', 41],
  ['IN', 245, 'CN', 36],
  ['IN', 245, 'US', 22],
  ['IN', 245, 'BR', 11],
  ['IN', 245, 'ID', 10],
  ['US', 130, 'CN', 33],
  ['US', 130, 'IN', 23],
  ['US', 130, 'US', 9],
  ['US', 130, 'ID', 7],
  ['US', 130, 'BR', 5],
  ['ID', 55, 'CN', 9],
  ['ID', 55, 'IN', 8],
  ['ID', 55, 'ID', 5],
  ['ID', 55, 'BR', 4],
  ['ID', 55, 'US', 3],
  ['PK', 43, 'CN', 8],
  ['PK', 43, 'IN', 5],
  ['PK', 43, 'US', 5],
  ['PK', 43, 'FR', 2],
  ['PK', 43, 'PK', 2],
];
export class Playground extends React.Component<{}, { isSunburstShown: boolean }> {
  onClick = (elements: Array<PartitionElementEvent | XYChartElementEvent>) => {
    // eslint-disable-next-line no-console
    console.log(elements[0]);
  };
  render() {
    return (
      <>
        <div className="chart">
          <Chart size={[300, 200]}>
            <Settings
              onElementClick={this.onClick}
              rotation={90}
              theme={{
                barSeriesStyle: {
                  displayValue: {
                    fontSize: 15,
                    fill: 'black',
                    offsetX: 5,
                    offsetY: -8,
                  },
                },
              }}
            />
            <Axis id="y1" position={Position.Left} />
            <BarSeries
              id="amount"
              xScaleType={ScaleType.Ordinal}
              xAccessor="x"
              yAccessors={['y']}
              data={[
                { x: 'trousers', y: 390, val: 1222 },
                { x: 'watches', y: 0, val: 1222 },
                { x: 'bags', y: 750, val: 1222 },
                { x: 'cocktail dresses', y: 854, val: 1222 },
              ]}
              displayValueSettings={{
                showValueLabel: true,
                isValueContainedInElement: true,
                hideClippedValue: true,
                valueFormatter: (d) => {
                  return `${d} $`;
                },
              }}
            />
          </Chart>
        </div>
        <div className="chart">
          <Chart>
            <Settings onElementClick={this.onClick} />
            <Partition
              id="pie"
              data={pieData}
              valueAccessor={(d) => {
                return d[3];
              }}
              layers={[
                {
                  groupByRollup: (d: PieDatum) => {
                    return d[0];
                  },
                  nodeLabel: (d) => {
                    return `dest: ${d}`;
                  },
                },
                {
                  groupByRollup: (d: PieDatum) => {
                    return d[2];
                  },
                  nodeLabel: (d) => {
                    return `source: ${d}`;
                  },
                },
              ]}
            />
          </Chart>
        </div>
      </>
    );
  }
}
