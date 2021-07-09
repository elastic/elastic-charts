/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings } from '../../packages/charts/src';
import { config } from '../../packages/charts/src/chart_types/partition_chart/layout/config';
import { ShapeTreeNode } from '../../packages/charts/src/chart_types/partition_chart/layout/types/viewmodel_types';
import { hueInterpolator } from '../../packages/charts/src/common/color_calcs';
import { mocks } from '../../packages/charts/src/mocks/hierarchical';
import { palettes } from '../../packages/charts/src/mocks/hierarchical/palettes';
import { keepDistinct } from '../../packages/charts/src/utils/common';
import { STORYBOOK_LIGHT_THEME } from '../shared';
import { countryLookup, productLookup, regionLookup } from '../utils/utils';

const interpolator = hueInterpolator(palettes.CET2s.map(([r, g, b]) => [r, g, b, 0.5]));

const countries = mocks.sunburst
  .map((d: any) => d.dest)
  .filter(keepDistinct)
  .sort()
  .reverse();

const countryCount = countries.length;

export const Example = () => (
  <Chart className="story-chart">
    <Settings showLegend theme={STORYBOOK_LIGHT_THEME} />
    <Partition
      id="spec_1"
      data={mocks.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: any) => productLookup[d].name.toUpperCase(),
          fillLabel: {
            valueFormatter: (d: number) => `${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            fontFamily: 'Helvetica',
            textColor: 'black',
            textInvertible: false,
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
            valueFormatter: (d: number) => `${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            textColor: 'black',
            textInvertible: false,
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
            fillColor: (d: ShapeTreeNode) =>
              // pick color by country
              interpolator(countries.indexOf(d.dataName) / countryCount),
          },
          fillLabel: { maximizeFontSize: boolean('Maximize font size layer 3', true) },
        },
      ]}
      config={{
        partitionLayout: PartitionLayout.treemap,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
        minFontSize: 4,
        maxFontSize: 36,
        idealFontSizeJump: 1.01,
        outerSizeRatio: 1,
      }}
    />
  </Chart>
);
