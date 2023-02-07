/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings, defaultPartitionValueFormatter } from '@elastic/charts';
import { arrayToLookup, hueInterpolator } from '@elastic/charts/src/common/color_calcs';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';
import { productDimension } from '@elastic/charts/src/mocks/hierarchical/dimension_codes';
import { palettes } from '@elastic/charts/src/mocks/hierarchical/palettes';

import { useBaseTheme } from '../../use_base_theme';

const productLookup = arrayToLookup((d: Datum) => d.sitc1, productDimension);

const interpolatorCET2s = hueInterpolator(palettes.CET2s.map(([r, g, b]) => [r, g, b, 0.7]));

const defaultFillColor = (colorMaker: any) => (d: any, i: number, a: any[]) => colorMaker(i / (a.length + 1));

export const Example = () => (
  <Chart>
    <Settings
      baseTheme={useBaseTheme()}
      showLegend
      showLegendExtra
      theme={{
        chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
      }}
    />
    <Partition
      id="spec_1"
      data={mocks.pie.map((d: any, i: number) => (i ? d : { ...d, exportVal: 0 }))}
      layout={PartitionLayout.treemap}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) =>
        `$${d === 0 ? 0 : defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`
      }
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          fillLabel: {
            valueFormatter: (d: number) =>
              `${d === 0 ? 0 : defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
          },
          shape: {
            fillColor: defaultFillColor(interpolatorCET2s),
          },
        },
      ]}
    />
  </Chart>
);

Example.parameters = {
  background: { default: 'white' },
};
