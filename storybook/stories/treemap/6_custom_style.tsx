/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, MODEL_KEY, Partition, PartitionLayout, Settings } from '@elastic/charts';
import { config } from '@elastic/charts/src/chart_types/partition_chart/layout/config';
import { arrayToLookup } from '@elastic/charts/src/common/color_calcs';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';
import { countryDimension } from '@elastic/charts/src/mocks/hierarchical/dimension_codes';

import { useBaseTheme } from '../../use_base_theme';
import { regionLookup } from '../utils/utils';

const countryLookup = arrayToLookup((d: Datum) => d.country, countryDimension);

const fillColor = ({ [MODEL_KEY]: model }: any) => {
  const root = model.parent;
  const siblingCountLayer1 = root.children.length;
  const i = model.sortIndex;
  const shade = Math.pow(0.3 + 0.5 * (i / (siblingCountLayer1 - 1)), 1 / 3);
  return `rgb(${Math.round(255 * shade)},${Math.round(255 * shade)},${Math.round(255 * shade)})`;
};

export const Example = () => (
  <Chart
    size={
      {
        /* height: 800 */
      }
    }
  >
    <Settings baseTheme={useBaseTheme()} />
    <Partition
      id="spec_1"
      data={mocks.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
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
            valueFormatter: (d: number) => `${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            textColor: 'rgba(60,60,60,1)',
            textInvertible: false,
            fontWeight: 600,
            fontStyle: 'normal',
            fontFamily: 'Courier New',
            fontVariant: 'normal',
          },
          shape: {
            fillColor,
          },
        },
      ]}
      config={{
        partitionLayout: PartitionLayout.treemap,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
        minFontSize: 8,
        maxFontSize: 14,
        idealFontSizeJump: 1.05,
        outerSizeRatio: 1,
      }}
    />
  </Chart>
);

Example.parameters = {
  backgrounds: { default: 'White' },
};
