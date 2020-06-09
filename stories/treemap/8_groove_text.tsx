/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, PartitionLayout } from '../../src';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import { ShapeTreeNode } from '../../src/chart_types/partition_chart/layout/types/viewmodel_types';
import { arrayToLookup, hueInterpolator } from '../../src/chart_types/partition_chart/layout/utils/calcs';
import { mocks } from '../../src/mocks/hierarchical';
import { countryDimension, regionDimension } from '../../src/mocks/hierarchical/dimension_codes';
import { palettes } from '../../src/mocks/hierarchical/palettes';

const regionLookup = arrayToLookup((d: Datum) => d.region, regionDimension);
const countryLookup = arrayToLookup((d: Datum) => d.country, countryDimension);

const interpolatorTurbo = hueInterpolator(palettes.turbo.map(([r, g, b]) => [r, g, b, 0.7]));

export const Example = () => (
  <Chart
    className="story-chart"
  >
    <Partition
      id="spec_1"
      data={mocks.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
          nodeLabel: (d: any) => regionLookup[d].regionName.toUpperCase(),
          fillLabel: {
            valueFormatter: () => '',
            fontFamily: 'Helvetica',
            textColor: '#555',
            textInvertible: false,
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
            valueFormatter: (d: number) => `${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            textColor: 'black',
            textInvertible: true,
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
            fillColor: (d: ShapeTreeNode) =>
              // primarily, pick color based on parent's index, but then perturb by the index within the parent
              interpolatorTurbo(
                (d.parent.sortIndex + d.sortIndex / d.parent.children.length) / (d.parent.parent.children.length + 1),
              )
            ,
          },
        },
      ]}
      config={{
        partitionLayout: PartitionLayout.treemap,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
        minFontSize: 4,
        maxFontSize: 114,
        idealFontSizeJump: 1.01,
        outerSizeRatio: 1,
      }}
    />
  </Chart>
);
