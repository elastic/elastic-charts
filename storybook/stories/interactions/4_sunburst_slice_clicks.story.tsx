/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Position, Settings, Partition, PartitionLayout } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { discreteColor, colorBrewerCategoricalPastel12 } from '../utils/utils';

const onElementListeners = {
  onElementClick: action('onElementClick'),
  onElementOver: action('onElementOver'),
  onElementOut: action('onElementOut'),
};

type PieDatum = [string, number, string, number];

const pieData: Array<PieDatum> = [
  ['CN', 301, 'IN', 44],
  ['CN', 301, 'US', 24],
  ['CN', 301, 'ID', 13],
  ['CN', 301, 'BR', 8],
  ['IN', 245, 'US', 22],
  ['IN', 245, 'BR', 11],
  ['IN', 245, 'ID', 10],
  ['US', 130, 'CN', 33],
  ['US', 130, 'IN', 23],
  ['US', 130, 'US', 9],
  ['US', 130, 'ID', 7],
  ['US', 130, 'BR', 5],
  ['ID', 55, 'BR', 4],
  ['ID', 55, 'US', 3],
  ['PK', 43, 'FR', 2],
  ['PK', 43, 'PK', 2],
];

export const Example = () => {
  const layout = select('layout', { sunburst: PartitionLayout.sunburst, treemap: PartitionLayout.treemap }, 'sunburst');
  return (
    <Chart>
      <Settings
        showLegend
        showLegendExtra
        baseTheme={useBaseTheme()}
        legendPosition={Position.Right}
        {...onElementListeners}
      />
      <Partition
        id="pie"
        data={pieData}
        layout={layout}
        valueAccessor={(d) => d[3]}
        layers={[
          {
            groupByRollup: (d: PieDatum) => d[0],
            nodeLabel: (d) => `dest: ${d}`,
            shape: {
              fillColor: (key, sortIndex) => discreteColor(colorBrewerCategoricalPastel12, 0.7)(sortIndex),
            },
          },
          {
            groupByRollup: (d: PieDatum) => d[2],
            nodeLabel: (d) => `source: ${d}`,
            shape: {
              fillColor: (key, sortIndex, node) =>
                discreteColor(colorBrewerCategoricalPastel12, 0.5)(node.parent.sortIndex),
            },
          },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
  markdown: `The \`onElementClick\` receive an argument with the following type definition: \`Array<[Array<LayerValue>, SeriesIdentifier]>\`.

Usually the outer array contains only one item but, in a near future, we will group smaller slices into a single one during the interaction.

For every clicked slice, you will have an array of \`LayerValue\`s and a \`SeriesIdentifier\`. The array of \`LayerValues\` is sorted
in the same way as the \`layers\` props, and helps you to idenfity the \`groupByRollup\` value and the slice value on every sunburst level.
      `,
};
