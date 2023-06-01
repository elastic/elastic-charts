/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings, defaultPartitionValueFormatter } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export const Example = () => (
  <Chart>
    <Settings
      baseTheme={useBaseTheme()}
      showLegend
      showLegendExtra
      theme={{
              }}
    />
    <Partition
      id="spec_1"
      data={[
        { sitc1: '7', exportVal: 1000000 },
        { sitc1: '3', exportVal: 0 },
      ]}
      layout={PartitionLayout.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${d === 0 ? 0 : defaultPartitionValueFormatter(Math.round(d))}`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          shape: {
            fillColor: (key, sortIndex, node, tree) =>
              indexInterpolatedFillColor(interpolatorCET2s(0.8))(null, sortIndex, tree),
          },
        },
      ]}
    />
  </Chart>
);
