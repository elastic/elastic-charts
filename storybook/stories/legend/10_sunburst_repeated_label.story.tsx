/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, LegendStrategy, Partition, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const flatLegend = boolean('flatLegend', false);
  const legendMaxDepth = number('legendMaxDepth', 2, {
    min: 0,
    max: 3,
    step: 1,
  });

  type TestDatum = { cat1: string; cat2: string; val: number };

  return (
    <Chart>
      <Settings
        showLegend
        flatLegend={flatLegend}
        legendStrategy={select<LegendStrategy>('legendStrategy', LegendStrategy, LegendStrategy.Key)}
        legendMaxDepth={legendMaxDepth}
        baseTheme={useBaseTheme()}
      />
      <Partition
        id="spec_1"
        data={[
          { cat1: 'A', cat2: 'A', val: 1 },
          { cat1: 'A', cat2: 'B', val: 1 },
          { cat1: 'B', cat2: 'A', val: 1 },
          { cat1: 'B', cat2: 'B', val: 1 },
          { cat1: 'C', cat2: 'A', val: 1 },
          { cat1: 'C', cat2: 'B', val: 1 },
        ]}
        valueAccessor={(d: TestDatum) => d.val}
        layers={[
          {
            groupByRollup: (d: TestDatum) => d.cat1,
          },
          {
            groupByRollup: (d: TestDatum) => d.cat2,
          },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
  markdown: `Nested legend with reused node labels means that they can reoccur in various points of the legend tree.`,
};
