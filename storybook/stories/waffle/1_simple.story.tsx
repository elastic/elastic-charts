/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  Datum,
  Partition,
  PartitionLayout,
  Settings,
  ShapeTreeNode,
  defaultPartitionValueFormatter,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { ArrayEntry } from '../../../packages/charts/src/chart_types/partition_chart/layout/utils/group_by_rollup';
import { useBaseTheme } from '../../use_base_theme';
import { colorBrewerCategoricalStark9, discreteColor } from '../utils/utils';

export const Example = () => {
  const showDebug = boolean('show table for debugging', false);
  const ascendingSort = boolean('ascending sort', false);
  // this is used to test the sorting capabilities
  const data = mocks.pie.slice(0, 4).sort(() => (Math.random() > 0.5 ? 1 : -1));
  const names: Record<string, string> = { '7': 'Al', '3': 'Au', '5': 'Ag', '8': 'Cu' };
  return (
    <Chart className="story-chart">
      <Settings
        theme={{
          chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
          chartPaddings: { left: 170, right: 170, top: 70, bottom: 70 },
        }}
        baseTheme={useBaseTheme()}
        debug={showDebug}
        showLegend
        flatLegend
        showLegendExtra
      />
      <Partition
        id="spec_1"
        data={data}
        layout={PartitionLayout.waffle}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => names[d],
            shape: {
              fillColor: (d: ShapeTreeNode) => discreteColor(colorBrewerCategoricalStark9.slice(1))(d.sortIndex),
            },
            sortPredicate: ascendingSort
              ? ([, node1]: ArrayEntry, [, node2]: ArrayEntry) => {
                  return node1.value - node2.value;
                }
              : undefined, // the descending sort is applied by default
          },
        ]}
      />
    </Chart>
  );
};
