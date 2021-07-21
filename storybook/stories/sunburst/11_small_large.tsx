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

import { useBaseTheme } from '../../use_base_theme';
import { indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';

export const Example = () => (
  <Chart>
    <Settings baseTheme={useBaseTheme()} />
    <Partition
      id="spec_1"
      data={[
        { sitc1: 'Machinery and transport equipment', exportVal: 280 },
        { sitc1: 'Mineral fuels, lubricants and related materials', exportVal: 80 },
      ]}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d))}`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => d,
          fillLabel: { textInvertible: true },
          shape: {
            fillColor: indexInterpolatedFillColor(interpolatorCET2s),
          },
        },
      ]}
      config={{
        partitionLayout: PartitionLayout.sunburst,
        clockwiseSectors: true,
        specialFirstInnermostSector: false,
        outerSizeRatio: 1,
      }}
    />
  </Chart>
);
