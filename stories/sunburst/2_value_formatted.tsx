/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, Settings } from '../../packages/charts/src';
import { config } from '../../packages/charts/src/chart_types/partition_chart/layout/config';
import { mocks } from '../../packages/charts/src/mocks/hierarchical';
import { STORYBOOK_LIGHT_THEME } from '../shared';
import { indexInterpolatedFillColor, interpolatorTurbo, productLookup } from '../utils/utils';

export const Example = () => (
  <Chart className="story-chart">
    <Settings theme={STORYBOOK_LIGHT_THEME} />
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
            textInvertible: true,
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
