/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { color } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings, PartialTheme } from '@elastic/charts';
import { defaultValueFormatter } from '@elastic/charts/src/chart_types/partition_chart/layout/config';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export const Example = () => {
  const theme: PartialTheme = {
    partition: {
      linkLabel: { maximumSection: Infinity, maxCount: 0 },
      sectorLineWidth: 10,
      sectorLineStroke: color('sectorLineStroke', 'lightgrey'),
      outerSizeRatio: 1,
    },
  };

  return (
    <Chart>
      <Settings theme={theme} baseTheme={useBaseTheme()} />
      <Partition
        id="spec_1"
        data={mocks.pie}
        layout={PartitionLayout.sunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: indexInterpolatedFillColor(interpolatorCET2s),
            },
          },
        ]}
      />
    </Chart>
  );
};
