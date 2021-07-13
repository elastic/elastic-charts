/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings } from '../../packages/charts/src';
import { STORYBOOK_LIGHT_THEME } from '../shared';
import { config, getFlatData, getLayerSpec, maxDepth } from '../utils/hierarchical_input_utils';
import { viridis18 as palette } from '../utils/utils';

const color = palette.slice().reverse();

export const Example = () => {
  return (
    <Chart className="story-chart">
      <Settings showLegend flatLegend legendMaxDepth={maxDepth} theme={STORYBOOK_LIGHT_THEME} />
      <Partition
        id="spec_1"
        data={getFlatData()}
        valueAccessor={(d: Datum) => d.value as number}
        valueFormatter={() => ''}
        layers={getLayerSpec(color)}
        config={{ ...config, partitionLayout: PartitionLayout.icicle }}
      />
    </Chart>
  );
};
