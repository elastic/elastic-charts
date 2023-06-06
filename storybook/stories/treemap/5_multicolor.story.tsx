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
  CHILDREN_KEY,
  Datum,
  defaultPartitionValueFormatter,
  PartialTheme,
  Partition,
  PartitionLayout,
  Settings,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s, regionLookup } from '../utils/utils';

const theme: PartialTheme = {
  partition: {
    minFontSize: 4,
    maxFontSize: 84,
    idealFontSizeJump: 1.05,
    outerSizeRatio: 1,
  },
};

export const Example = () => (
  <Chart>
    <Settings theme={theme} baseTheme={useBaseTheme()} />
    <Partition
      id="spec_1"
      data={mocks.sunburst}
      layout={PartitionLayout.treemap}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      topGroove={0}
      layers={[
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
          nodeLabel: (d: any) => regionLookup[d].regionName,
          fillLabel: {
            valueFormatter: () => '',
            textColor: 'black',
          },
          shape: {
            fillColor: 'rgba(0,0,0,0)',
          },
        },
        {
          groupByRollup: (d: Datum) => d.dest,
          nodeLabel: (d: any) => countryLookup[d].name,
          fillLabel: {
            valueFormatter: (d: number) => `${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            textColor: 'rgba(60,60,60,1)',
            fontWeight: 100,
            fontStyle: 'normal',
            fontFamily: 'Din Condensed',
            fontVariant: 'normal',
          },
          shape: {
            fillColor: (key, sortIndex, node) =>
              indexInterpolatedFillColor(interpolatorCET2s())(
                null,
                node.parent.sortIndex,
                node.parent.parent[CHILDREN_KEY],
              ),
          },
        },
      ]}
    />
  </Chart>
);

Example.parameters = {
  background: { default: 'white' },
};
