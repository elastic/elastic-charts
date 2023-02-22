/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { color } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, Settings, defaultPartitionValueFormatter } from '@elastic/charts';
import { entryValue, SORT_INDEX_KEY } from '@elastic/charts/src';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export const Example = () => {
  const partialCustomTheme = {
    chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
    background: {
      color: color('Change background container color', '#1c1c24'),
    },
  };
  return (
    <Chart>
      <Settings theme={partialCustomTheme} baseTheme={useBaseTheme()} />
      <Partition
        id="spec_1"
        data={mocks.pie}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: (entry, tree) =>
                indexInterpolatedFillColor(interpolatorCET2s(0.8))(null, entryValue(entry)[SORT_INDEX_KEY], tree),
            },
          },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  background: { disable: true },
};
