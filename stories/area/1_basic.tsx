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

import { AreaSeries, Chart, ScaleType, Settings } from '../../packages/charts/src';
import { KIBANA_METRICS } from '../../packages/charts/src/utils/data_samples/test_dataset_kibana';
import { SB_SOURCE_PANEL } from '../utils/storybook';

export const Example = () => {
  const { data } = KIBANA_METRICS.metrics.kibana_os_load[0];
  return (
    <Chart className="story-chart" size={[90, 100]}>
      <Settings
        theme={{
          chartMargins: { top: 0, left: 0, right: 0, bottom: 0 },
          chartPaddings: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      />
      <AreaSeries
        id="area"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Log}
        xAccessor={0}
        yAccessors={[2]}
        y0Accessors={[1]}
        data={[
          [-1, 2, 10],
          [0, 2, 10],
          [1, 2, null],
          [2, 3, 5],
          [3, 3, 5],
        ]}
      />
    </Chart>
  );
};

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
