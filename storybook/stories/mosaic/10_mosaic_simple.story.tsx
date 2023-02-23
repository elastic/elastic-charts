/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, radios } from '@storybook/addon-knobs';
import React from 'react';

import {
  AdditiveNumber,
  ArrayEntry,
  Chart,
  Datum,
  Partition,
  PartitionLayout,
  Settings,
  defaultPartitionValueFormatter,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';
import { keepDistinct } from '@elastic/charts/src/utils/common';

import { useBaseTheme } from '../../use_base_theme';
import { countryLookup, colorBrewerCategoricalPastel12B, regionLookup } from '../utils/utils';

const productLookup: Record<string, { label: string; position: number }> = {
  '3': { label: 'Firefox', position: 1 },
  '5': { label: 'Edge (Chromium)', position: 4 },
  '6': { label: 'Safari', position: 2 },
  '7': { label: 'Chrome', position: 0 },
  '8': { label: 'Brave', position: 3 },
};

const data = mocks.sunburst
  .map((d) => (d.dest === 'chn' ? { ...d, dest: 'zaf' } : d))
  .filter(
    (d: any) =>
      ['eu', 'na', 'as', 'af'].includes(countryLookup[d.dest].continentCountry.slice(0, 2)) &&
      ['3', '5', '6', '7', '8'].includes(d.sitc1),
  );

const productPalette = colorBrewerCategoricalPastel12B.slice(2);

const productToColor = new Map(
  data
    .map((d) => d.sitc1)
    .filter(keepDistinct)
    .sort()
    .map((sitc1, i) => [sitc1, `rgba(${productPalette[i % productPalette.length].join(',')}, 0.7)`]),
);

export const Example = () => {
  const partitionLayout = radios(
    'Partition layout',
    {
      [PartitionLayout.mosaic]: PartitionLayout.mosaic,
      [PartitionLayout.treemap]: PartitionLayout.treemap,
      [PartitionLayout.sunburst]: PartitionLayout.sunburst,
    },
    PartitionLayout.mosaic,
  );
  return (
    <Chart className="story-chart">
      <Settings
        showLegend={boolean('Show legend', true)}
        showLegendExtra={boolean('Show legend values', true)}
        flatLegend={boolean('Flat legend', false)}
        theme={{
          chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
          partition: {
            linkLabel: { maxCount: 0 }, // relevant for sunburst only
            outerSizeRatio: 0.9, // relevant for sunburst only
          },
        }}
        baseTheme={useBaseTheme()}
      />
      <Partition
        id="spec_1"
        data={data}
        layout={partitionLayout}
        valueAccessor={(d: Datum) => d.exportVal as AdditiveNumber}
        valueFormatter={(d: number) => `${defaultPartitionValueFormatter(Math.round(d / 1000000000))}`}
        layers={[
          {
            groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
            nodeLabel: (name) => (name !== null ? regionLookup[name].regionName : ''),
            fillLabel: {
              fontWeight: 400,
            },
            shape: {
              fillColor: partitionLayout === PartitionLayout.sunburst ? 'lightgrey' : 'white',
            },
          },
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d) => (d !== null ? `${productLookup[d]?.label}` : ''),
            shape: {
              fillColor: (nodeKey) => productToColor.get(nodeKey)!,
            },
            sortPredicate: ([name1]: ArrayEntry, [name2]: ArrayEntry) => {
              const position1 = Number(productLookup[name1]?.position);
              const position2 = Number(productLookup[name2]?.position);
              return position2 - position1;
            },
            fillLabel: {
              fontWeight: 200,
              minFontSize: 6,
              maxFontSize: 16,
              maximizeFontSize: true,
              fontFamily: 'Helvetica Neue',
              valueFormatter: () => '',
            },
          },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
