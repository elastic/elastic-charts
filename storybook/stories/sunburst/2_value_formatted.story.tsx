/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, Settings, PartialTheme, defaultPartitionValueFormatter } from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { indexInterpolatedFillColor, interpolatorTurbo, productLookup } from '../utils/utils';

export const Example = () => {
  const onElementClick = boolean('onElementClick listener', true);
  const onElementOver = boolean('onElementOver listener', true);
  const theme: PartialTheme = {
    chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
    partition: {
      outerSizeRatio: 0.9,
      linkLabel: {
        fontStyle: 'italic',
        valueFont: { fontWeight: 900 },
        maxTextLength: number('maxTextLength', 20, { range: true, min: 1, max: 100 }),
      },
    },
  };

  return (
    <Chart>
      <Settings
        theme={theme}
        baseTheme={useBaseTheme()}
        onElementClick={onElementClick ? action('onElementClick') : undefined}
        onElementOver={onElementOver ? action('onElementOver') : undefined}
      />
      <Partition
        id="spec_1"
        data={mocks.pie}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
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
              fillColor: (key, sortIndex, node, tree) =>
                indexInterpolatedFillColor(interpolatorTurbo(0.8))(null, sortIndex, tree),
            },
          },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
