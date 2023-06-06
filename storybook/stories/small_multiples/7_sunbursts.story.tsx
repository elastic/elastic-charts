/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, select, number } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  Datum,
  GroupBy,
  LegendStrategy,
  PartialTheme,
  Partition,
  PartitionLayout,
  Settings,
  SmallMultiples,
  defaultPartitionValueFormatter,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';
import { keepDistinct } from '@elastic/charts/src/utils/common';

import { useBaseTheme } from '../../use_base_theme';
import { colorBrewerCategoricalPastel12, countryLookup, productLookup, regionLookup } from '../utils/utils';

const data = mocks.sunburst; // .filter((d) => countryLookup[d.dest].continentCountry.slice(0, 2) === 'eu');

const productToColor = new Map(
  data
    .map((d) => d.sitc1)
    .filter(keepDistinct)
    .sort()
    .map((sitc1, i) => [sitc1, `rgb(${colorBrewerCategoricalPastel12[i % 12].join(',')})`]),
);

const countryToColor = new Map(
  data
    .map((d) => d.dest)
    .filter(keepDistinct)
    .sort()
    .map((dest, i, a) => {
      const luma = Math.floor(96 + 128 * ((a.length - i - 1) / a.length));
      return [dest, `rgb(${luma},${luma},${luma})`];
    }),
);

const onElementListeners = {
  onElementClick: action('onElementClick'),
  onElementOver: action('onElementOver'),
  onElementOut: action('onElementOut'),
};

const theme: PartialTheme = {
  chartPaddings: { top: 6, left: 8, bottom: 6, right: 8 },
  partition: {
    linkLabel: {
      maxCount: 0,
    },
    fontFamily: 'Arial',
    fillLabel: {
      fontStyle: 'italic',
      fontWeight: 900,
      valueFont: {
        fontFamily: 'Menlo',
        fontStyle: 'normal',
        fontWeight: 100,
      },
    },
    minFontSize: 1,
    idealFontSizeJump: 1.1,
    outerSizeRatio: 1,
    emptySizeRatio: 0,
    circlePadding: 4,
  },
};

export const Example = () => {
  const layout = select(
    'Inner breakdown layout',
    {
      horizontal: 'h',
      vertical: 'v',
      zigzag: 'z',
    },
    'z',
  );

  return (
    <Chart>
      <Settings
        {...onElementListeners}
        showLegend={boolean('Show legend', true)}
        legendValue={boolean('Show legend value', false) ? 'lastBucket' : 'none'}
        legendStrategy={LegendStrategy.Key}
        flatLegend={boolean('Flat legend', true)}
        theme={theme}
        baseTheme={useBaseTheme()}
        debug={boolean('Debug', false)}
      />
      <GroupBy
        id="split"
        by={(_, d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2)}
        format={(name) => regionLookup[name].regionName}
        sort={select('Panel order', { alphaAsc: 'alphaAsc', alphaDesc: 'alphaDesc' }, 'alphaAsc')}
      />
      <SmallMultiples
        splitHorizontally={layout === 'h' ? 'split' : undefined}
        splitVertically={layout === 'v' ? 'split' : undefined}
        splitZigzag={layout === 'z' ? 'split' : undefined}
        style={{
          horizontalPanelPadding: {
            outer: number('Horizontal outer pad', 0.15, {
              range: true,
              min: 0,
              max: 0.5,
              step: 0.05,
            }),
            inner: number('Horizontal inner pad', 0.05, {
              range: true,
              min: 0,
              max: 0.5,
              step: 0.05,
            }),
          },
          verticalPanelPadding: {
            outer: number('Vertical outer pad', 0.15, {
              range: true,
              min: 0,
              max: 0.5,
              step: 0.05,
            }),
            inner: number('Vertical inner pad', 0.05, {
              range: true,
              min: 0,
              max: 0.5,
              step: 0.05,
            }),
          },
        }}
      />
      <Partition
        id="spec_2"
        data={data}
        layout={PartitionLayout.sunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: any) => productLookup[d].name,
            fillLabel: { maximizeFontSize: true },
            shape: {
              fillColor: (key) => productToColor.get(key)!,
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d].name,
            fillLabel: { maximizeFontSize: true },
            shape: {
              fillColor: (key) => countryToColor.get(key)!,
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
