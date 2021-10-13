/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, PrimitiveValue, Settings } from '@elastic/charts';
import data from '@elastic/charts/src/mocks/hierarchical/cpu_profile_tree_mock.json';

import { config } from '../utils/hierarchical_input_utils';
import { discreteColor, viridis18 as palette } from '../utils/utils';

const color = palette.slice().reverse();

const getLayerSpec = (maxDepth: number = 30) =>
  [...new Array(maxDepth + 1)].map((_, depth) => ({
    groupByRollup: (d: Datum) => data.dictionary[d.layers[depth]],
    nodeLabel: (d: PrimitiveValue) => `${String(d)}/`,
    showAccessor: (d: PrimitiveValue) => d !== undefined,
    shape: {
      fillColor: () => discreteColor(color, 0.8)(depth),
    },
  }));

export const Example = () => {
  const clipText = boolean("Allow, and clip, texts that wouldn't otherwise fit", true);
  return (
    <Chart>
      <Settings />
      <Partition
        id="spec_1"
        data={data.facts}
        valueAccessor={(d: Datum) => d.value as number}
        valueFormatter={() => ''}
        layers={getLayerSpec()}
        config={{
          ...config,
          partitionLayout: PartitionLayout.icicle,
          drilldown: true,
          fillLabel: {
            ...config.fillLabel,
            clipText,
            padding: { left: 0, right: 0, top: 0, bottom: 0 },
          },
          minFontSize: clipText ? 9 : 6,
          maxFontSize: clipText ? 9 : 20,
          maxRowCount: 1,
          animation: { duration: 500 },
        }}
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
