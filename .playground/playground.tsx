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
import { Chart, Partition, PartitionElementEvent, XYChartElementEvent, Settings } from '../src';

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
            <Settings showLegend />
            <Partition
              id="amount"
              data={[
                { x: 'trousers', y: 390, g: 'a', val: 1222 },
                { x: 'watches', y: 0, g: 'a', val: 1222 },
                { x: 'bags', y: 750, g: 'a', val: 1222 },
                { x: 'cocktail dresses', y: 854, g: 'a', val: 1222 },
                { x: 'cocktail dresses', y: 854, g: 'b', val: 1222 },
              ]}
              valueAccessor={(d) => d.y}
              layers={[
                {
                  groupByRollup: (d: any) => d.x,
                },
                {
                  groupByRollup: (d: any) => d.g,
                },
              ]}
            />
          </Chart>
        </div>
      </>
    );
  }
}
