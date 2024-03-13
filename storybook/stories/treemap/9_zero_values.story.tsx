/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  Chart,
  Datum,
  LegendValue,
  Partition,
  PartitionLayout,
  Settings,
  defaultPartitionValueFormatter,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings baseTheme={useBaseTheme()} showLegend legendValues={[LegendValue.CurrentAndLastValue]} />
    <Partition
      id="spec_1"
      data={mocks.pie.map((d: any, i: number) => (i ? d : { ...d, exportVal: 0 }))}
      layout={PartitionLayout.treemap}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) =>
        `$${d === 0 ? 0 : defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`
      }
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          fillLabel: {
            valueFormatter: (d: number) =>
              `${d === 0 ? 0 : defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
          },
          shape: {
            fillColor: (key, sortIndex, node) =>
              indexInterpolatedFillColor(interpolatorCET2s())(null, node.sortIndex, node.parent.children),
          },
        },
      ]}
    />
  </Chart>
);
