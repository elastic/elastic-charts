/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings, ShapeTreeNode } from '@elastic/charts';
import { config } from '@elastic/charts/src/chart_types/partition_chart/layout/config';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { ArrayEntry } from '../../../packages/charts/src/chart_types/partition_chart/layout/utils/group_by_rollup';
import { useBaseTheme } from '../../use_base_theme';
import { colorBrewerCategoricalStark9, discreteColor, productLookup } from '../utils/utils';

export const Example = () => {
  const showDebug = boolean('show table for debugging', false);
  const ascendingSort = boolean('ascending sort', false);
  // this is used to test the sorting capabilities
  const data = mocks.pie.slice(0, 4).sort(() => (Math.random() > 0.5 ? 1 : -1));
  return (
    <Chart className="story-chart">
      <Settings baseTheme={useBaseTheme()} debug={showDebug} showLegend flatLegend showLegendExtra />
      <Partition
        id="spec_1"
        data={data}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
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
        config={{
          partitionLayout: PartitionLayout.waffle,
          margin: { left: 0.2, right: 0.2, top: 0.2, bottom: 0.2 },
        }}
      />
    </Chart>
  );
};
