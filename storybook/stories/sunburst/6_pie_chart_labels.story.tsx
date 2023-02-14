/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings, defaultPartitionValueFormatter } from '@elastic/charts';
import { entryValue, SORT_INDEX_KEY } from '@elastic/charts/src';

import { useBaseTheme } from '../../use_base_theme';
import { indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';

export const Example = () => (
  <Chart>
    <Settings
      baseTheme={useBaseTheme()}
      theme={{
        chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
      }}
    />
    <Partition
      id="spec_1"
      data={[
        { sitc1: 'Machinery and transport equipment', exportVal: 5 },
        { sitc1: 'Mineral fuels, lubricants and related materials', exportVal: 4 },
      ]}
      layout={PartitionLayout.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d))}`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          // nodeLabel: (d: Datum) => d,
          shape: {
            fillColor: (entry, tree) =>
              indexInterpolatedFillColor(interpolatorCET2s)(null, entryValue(entry)[SORT_INDEX_KEY], tree),
          },
        },
      ]}
    />
  </Chart>
);
