/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, LegendStrategy, Partition, PartitionLayout, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { config, getFlatData, getLayerSpec, maxDepth } from '../utils/hierarchical_input_utils';
import { plasma18 as palette } from '../utils/utils';

const color = [...palette].reverse();

export const Example = () => {
  return (
    <Chart>
      <Settings
        showLegend
        flatLegend
        legendPosition="right"
        legendStrategy={LegendStrategy.PathWithDescendants}
        legendMaxDepth={maxDepth}
        baseTheme={useBaseTheme()}
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

Example.parameters = {
  backgrounds: { default: 'White' },
};
