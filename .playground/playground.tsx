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

import { Chart, ScaleType, Settings, AreaSeries } from '../src';

export const Playground = () => {
  return (
    <div className="App">
      <Chart size={[100, 100]}>
        <Settings
          theme={{
            chartMargins: { top: 0, left: 0, right: 0, bottom: 0 },
            chartPaddings: { top: 0, left: 0, right: 0, bottom: 0 },
          }}
        />
        <AreaSeries
          id="test"
          data={[
            [0, 2, 10],
            [1, 2, null],
            [2, 3, 5],
            [3, 3, 5],
          ]}
          xAccessor={0}
          y0Accessors={[1]}
          yAccessors={[2]}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          areaSeriesStyle={{
            point: {
              visible: true,
            },
          }}
        />
      </Chart>
    </div>
  );
};
