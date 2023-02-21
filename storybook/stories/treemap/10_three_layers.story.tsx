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
  PartialTheme,
  defaultPartitionValueFormatter,
  entryKey,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';
import { keepDistinct } from '@elastic/charts/src/utils/common';

import { useBaseTheme } from '../../use_base_theme';
import {
  countryLookup,
  indexInterpolatedFillColor,
  interpolatorCET2s,
  productLookup,
  regionLookup,
} from '../utils/utils';

const countries = mocks.sunburst
  .map((d: any) => d.dest)
  .filter(keepDistinct)
  .sort()
  .reverse();

const theme: PartialTheme = {
  chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
  partition: {
    minFontSize: 4,
    maxFontSize: 36,
    idealFontSizeJump: 1.01,
    outerSizeRatio: 1,
  },
};

export const Example = () => (
  <Chart>
    <Settings showLegend theme={theme} baseTheme={useBaseTheme()} />
    <Partition
      id="spec_1"
      data={mocks.sunburst}
      layout={PartitionLayout.treemap}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: any) => productLookup[d].name.toUpperCase(),
          fillLabel: {
            valueFormatter: (d: number) => `${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            fontFamily: 'Helvetica',
            textColor: 'black',
            fontWeight: 900,
            minFontSize: 2,
            maxFontSize: 20,
            idealFontSizeJump: 1.01,
            maximizeFontSize: boolean('Maximize font size layer 1', true),
          },
          shape: { fillColor: 'rgba(0,0,0,0)' },
        },
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
          nodeLabel: (d: any) => regionLookup[d].regionName,
          fillLabel: {
            valueFormatter: (d: number) => `${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            textColor: 'black',
            fontWeight: 200,
            fontStyle: 'normal',
            fontFamily: 'Helvetica',
            valueFont: { fontWeight: 400, fontStyle: 'italic' },
            minFontSize: 2,
            maxFontSize: 10,
            idealFontSizeJump: 1.01,
            maximizeFontSize: boolean('Maximize font size layer 2', true),
          },
          shape: {
            fillColor: 'rgba(0, 0, 0, 0.07)',
          },
        },
        {
          groupByRollup: (d: Datum) => d.dest,
          nodeLabel: (d: any) => countryLookup[d].name,
          shape: {
            fillColor: (d) =>
              // pick color by country
              indexInterpolatedFillColor(interpolatorCET2s(0.5))(null, countries.indexOf(entryKey(d)), countries),
          },
          fillLabel: { maximizeFontSize: boolean('Maximize font size layer 3', true) },
        },
      ]}
    />
  </Chart>
);

Example.parameters = {
  background: { default: 'white' },
};
