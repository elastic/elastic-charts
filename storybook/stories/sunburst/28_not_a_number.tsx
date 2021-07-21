/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings } from '@elastic/charts';
import { config } from '@elastic/charts/src/chart_types/partition_chart/layout/config';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export const Example = () => (
  <Chart>
    <Settings baseTheme={useBaseTheme()} />
    <Partition
      id="spec_1"
      data={mocks.pie
        .slice(0, 2)
        .concat(mocks.pie.slice(2, 3).map((s) => ({ ...s, exportVal: undefined as unknown as number })))
        .concat(mocks.pie.slice(3))}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          fillLabel: { textInvertible: true },
          shape: {
            fillColor: indexInterpolatedFillColor(interpolatorCET2s),
          },
        },
      ]}
      config={{ partitionLayout: PartitionLayout.sunburst }}
    />
  </Chart>
);

Example.parameters = {
  backgrounds: { default: 'White' },
};
