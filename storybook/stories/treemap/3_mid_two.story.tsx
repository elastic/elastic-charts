/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { Datum, PartialTheme } from '@elastic/charts';
import { Chart, defaultPartitionValueFormatter, Partition, PartitionLayout, Settings } from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { countryLookup, interpolatorTurbo, regionLookup } from '../utils/utils';

const theme: PartialTheme = {
  partition: {
    minFontSize: 4,
    maxFontSize: 84,
    idealFontSizeJump: 1.15,
    outerSizeRatio: 1,
  },
};

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings showLegend theme={theme} baseTheme={useBaseTheme()} />
    <Partition
      id="spec_1"
      data={mocks.sunburst}
      layout={PartitionLayout.treemap}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
          nodeLabel: (d: any) => regionLookup[d].regionName,
          fillLabel: {
            valueFormatter: (d: number) => `${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            fontFamily: 'Helvetica',
            textColor: 'grey',
          },
          shape: { fillColor: 'rgba(0,0,0,0)' },
        },
        {
          groupByRollup: (d: Datum) => d.dest,
          nodeLabel: (d: any) => countryLookup[d].name,
          fillLabel: {
            valueFormatter: (d: number) => `${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            textColor: 'black',
            fontWeight: 200,
            fontStyle: 'normal',
            fontFamily: 'Helvetica',
            fontVariant: 'small-caps',
            valueFont: { fontWeight: 400, fontStyle: 'italic' },
          },
          shape: {
            fillColor: (key, sortIndex, node) => {
              // primarily, pick color based on parent's index, but then perturb by the index within the parent
              return interpolatorTurbo()(
                (node.parent.sortIndex + node.sortIndex / node.parent.children.length) /
                  (node.parent.parent.children.length + 1),
              );
            },
          },
        },
      ]}
    />
  </Chart>
);
