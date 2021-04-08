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

import { Chart, AreaSeries, ScaleType, Settings } from '../src';
import { KIBANA_METRICS } from '../src/utils/data_samples/test_dataset_kibana';

export class Playground extends React.Component {
  render() {
    return (
      <div className="App">
        <Chart size={[500, 200]}>
          <Settings customDescription="This is an area chart showing kibana sample data." />
          <AreaSeries
            id="area"
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            yAccessors={[1]}
            data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          />
        </Chart>
      </div>
    );
  }
}
