/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { Datum, PartialTheme } from '@elastic/charts';
import {
  Chart,
  defaultPartitionValueFormatter,
  HorizontalAlignment,
  Partition,
  PartitionLayout,
  Settings,
  VerticalAlignment,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s, regionLookup } from '../utils/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  // the alignment options apply to the rectangular layouts only
  const layout = customKnobs.fromEnum('partitionLayout', PartitionLayout, PartitionLayout.treemap, {
    include: ['treemap', 'mosaic', 'flame'],
    group: 'Partition',
  });
  const verticalAlignment = customKnobs.fromEnum('fillLabel.verticalAlignment', VerticalAlignment, undefined, {
    include: ['Top', 'Middle', 'Bottom'],
    allowUndefined: true,
    undefinedLabel: 'default',
    group: 'Partition',
  });
  const horizontalAlignment = customKnobs.fromEnum('fillLabel.horizontalAlignment', HorizontalAlignment, undefined, {
    include: ['Left', 'Center', 'Right'],
    allowUndefined: true,
    undefinedLabel: 'default',
    group: 'Partition',
  });
  const theme: PartialTheme = {
    partition: {
      fillLabel: { verticalAlignment, horizontalAlignment },
    },
  };

  return (
    <Chart title={title} description={description}>
      <Settings theme={theme} baseTheme={useBaseTheme()} />
      <Partition
        id="spec_1"
        data={mocks.sunburst}
        layout={layout}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
            nodeLabel: (d: Datum) => regionLookup[d].regionName,
            shape: {
              fillColor: (key, sortIndex, node, tree) =>
                indexInterpolatedFillColor(interpolatorCET2s())(null, sortIndex, tree),
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: Datum) => countryLookup[d].name,
            shape: {
              fillColor: (key, sortIndex, node, tree) =>
                indexInterpolatedFillColor(interpolatorCET2s())(null, sortIndex, tree),
            },
          },
        ]}
      />
    </Chart>
  );
};
