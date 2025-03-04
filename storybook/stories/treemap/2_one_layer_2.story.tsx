/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, select } from '@storybook/addon-knobs';
import React from 'react';

import type { Datum } from '@elastic/charts';
import { Chart, defaultPartitionValueFormatter, Partition, PartitionLayout, Settings } from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { colorBrewerCategoricalPastel12, discreteColor, productLookup } from '../utils/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const layout = select(
    'partitionLayout',
    {
      Treemap: PartitionLayout.treemap,
      Sunburst: PartitionLayout.sunburst,
    },
    PartitionLayout.treemap,
  );
  return (
    <Chart title={title} description={description}>
      <Settings
        baseTheme={useBaseTheme()}
        theme={{
          partition: {
            fillLabel: {
              textColor: boolean('custom fillLabel.textColor', false)
                ? color('fillLabel.textColor', 'rgba(0, 0, 0, 1)')
                : undefined,
            },
          },
        }}
      />
      <Partition
        id="spec_1"
        data={mocks.pie}
        layout={layout}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            fillLabel: {
              valueFormatter: (d: number) => `${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
              valueFont: {
                fontWeight: 100,
              },
            },
            shape: {
              fillColor: (key, sortIndex) => discreteColor(colorBrewerCategoricalPastel12)(sortIndex),
            },
          },
        ]}
      />
    </Chart>
  );
};
