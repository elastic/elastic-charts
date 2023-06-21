/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Partition, PartitionLayout, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        baseTheme={useBaseTheme()}
        legendStrategy="nodeWithDescendants"
        legendMaxDepth={1} // testing this option
      />
      <Partition
        id="spec_1"
        data={[{ g1: 1, g2: 'a', v: 2 }]}
        layout={PartitionLayout.sunburst}
        valueAccessor={(d) => d.v}
        layers={[
          {
            groupByRollup: (d: any) => d.g1,
            nodeLabel: () => 'Testing a super duper really long legend',
            shape: {
              fillColor: () => '#90E0EF',
            },
          },
          {
            groupByRollup: (d: any) => d.g2,
            nodeLabel: () => 'Testing a super duper really long legend',
            shape: {
              fillColor: () => '#00B4D8',
            },
          },
        ]}
      />
    </Chart>
  );
};
