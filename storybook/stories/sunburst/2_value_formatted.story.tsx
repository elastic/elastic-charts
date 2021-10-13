/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, Settings } from '@elastic/charts';
import { config } from '@elastic/charts/src/chart_types/partition_chart/layout/config';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { indexInterpolatedFillColor, interpolatorTurbo, productLookup } from '../utils/utils';

export const Example = () => (
  <Chart>
    <Settings />
    <Partition
      id="spec_1"
      data={mocks.pie}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          fillLabel: {
            fontWeight: 100,
            fontStyle: 'italic',
            valueFont: {
              fontFamily: 'Menlo',
              fontStyle: 'normal',
              fontWeight: 900,
            },
          },
          shape: {
            fillColor: indexInterpolatedFillColor(interpolatorTurbo),
          },
        },
      ]}
      config={{
        outerSizeRatio: 0.9,
        linkLabel: {
          fontStyle: 'italic',
          valueFont: { fontWeight: 900 },
          maxTextLength: number('maxTextLength', 20, { range: true, min: 1, max: 100 }),
        },
      }}
    />
  </Chart>
);

Example.parameters = {
  background: { default: 'white' },
};
