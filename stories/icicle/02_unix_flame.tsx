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

import { Chart, Datum, LegendStrategy, Partition, PartitionLayout, Settings } from '../../src';
import { STORYBOOK_LIGHT_THEME } from '../shared';
import { config, getFlatData, getLayerSpec, maxDepth } from '../utils/hierarchical_input_utils';
import { plasma18 as palette } from '../utils/utils';

const color = [...palette].reverse();

export const Example = () => {
  return (
    <Chart className="story-chart">
      <Settings
        showLegend
        flatLegend
        legendPosition="right"
        legendStrategy={LegendStrategy.PathWithDescendants}
        legendMaxDepth={maxDepth}
        theme={STORYBOOK_LIGHT_THEME}
      />
      <Partition
        id="spec_1"
        data={getFlatData()}
        valueAccessor={(d: Datum) => d.value as number}
        valueFormatter={() => ''}
        layers={getLayerSpec(color)}
        config={{ ...config, partitionLayout: PartitionLayout.flame }}
      />
    </Chart>
  );
};
