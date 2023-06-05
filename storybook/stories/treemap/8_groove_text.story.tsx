/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  Datum,
  Partition,
  PartitionLayout,
  Settings,
  PartialTheme,
  defaultPartitionValueFormatter,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { countryLookup, interpolatorTurbo, regionLookup } from '../utils/utils';

const theme: PartialTheme = {
  partition: {
    minFontSize: 4,
    maxFontSize: 114,
    idealFontSizeJump: 1.01,
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
      layers={[
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
          nodeLabel: (d: any) => regionLookup[d].regionName.toUpperCase(),
          fillLabel: {
            valueFormatter: () => '',
            fontFamily: 'Helvetica',
            textColor: '#555',
            fontWeight: 100,
            padding: {
              top: number('group padding top', 0, { range: true, min: 0, max: 20 }),
              right: number('group padding right', 2, { range: true, min: 0, max: 20 }),
              bottom: number('group padding bottom', 0, { range: true, min: 0, max: 20 }),
              left: number('group padding left', 2, { range: true, min: 0, max: 20 }),
            },
            minFontSize: 2,
            maxFontSize: 50,
            idealFontSizeJump: 1.01,
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
            valueFont: { fontWeight: 400, fontStyle: 'italic' },
            padding: {
              top: number('leaf padding top', 0, { range: true, min: 0, max: 200 }),
              right: number('leaf padding right', 2, { range: true, min: 0, max: 200 }),
              bottom: number('leaf padding bottom', 0, { range: true, min: 0, max: 200 }),
              left: number('leaf padding left', 2, { range: true, min: 0, max: 200 }),
            },
            minFontSize: 2,
            maxFontSize: 100,
            idealFontSizeJump: 1.01,
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

Example.parameters = {
  background: { default: 'white' },
};
