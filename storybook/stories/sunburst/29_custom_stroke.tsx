/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { color } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, PartialTheme, Partition, PartitionLayout, Settings } from '@elastic/charts';
import { config } from '@elastic/charts/src/chart_types/partition_chart/layout/config';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';

export const Example = () => {
  const partialCustomTheme: PartialTheme = {
    background: {
      color: color('Change background container color', '#1c1c24'),
    },
  };
  return (
    <Chart>
      <Settings theme={partialCustomTheme} baseTheme={useBaseTheme()} />
      <Partition
        id="spec_1"
        data={mocks.manyPie}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.origin,
            nodeLabel: (d: Datum) => countryLookup[d].name,
            fillLabel: { textInvertible: true },
            shape: {
              fillColor: indexInterpolatedFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{
          partitionLayout: PartitionLayout.sunburst,
          linkLabel: { maxCount: 15, textColor: 'white' },
          sectorLineStroke: 'rgb(26, 27, 32)', // same as the dark theme
          sectorLineWidth: 1.2,
        }}
      />
    </Chart>
  );
};

Example.parameters = {
  themes: { default: 'Dark' },
  backgrounds: { disable: true },
};
