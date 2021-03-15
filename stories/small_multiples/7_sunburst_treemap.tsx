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

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  Datum,
  GroupBy,
  MODEL_KEY,
  Partition,
  PartitionLayout,
  Settings,
  ShapeTreeNode,
  SmallMultiples,
} from '../../src';
import { config } from '../../src/chart_types/partition_chart/layout/config';
import { mocks } from '../../src/mocks/hierarchical';
import { STORYBOOK_LIGHT_THEME } from '../shared';
import {
  discreteColor,
  colorBrewerCategoricalStark9,
  countryLookup,
  productLookup,
  regionLookup,
} from '../utils/utils';

const data = mocks.sunburst; // .filter((d) => countryLookup[d.dest].continentCountry.slice(0, 2) === 'eu');

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
    <Chart className="story-chart">
      <Settings
        showLegend={boolean('Show legend', true)}
        legendStrategy="pathWithDescendants"
        flatLegend={false}
        theme={STORYBOOK_LIGHT_THEME}
      />
      <GroupBy id="split" by={(_, { h }) => h} format={(h) => `${h}`} sort="alphaAsc" />
      <SmallMultiples
        splitHorizontally={layout === 'h' ? 'split' : undefined}
        splitVertically={layout === 'v' ? 'split' : undefined}
        style={{ verticalPanelPadding: [0, 0] }}
      />
      <Partition
        id="spec_1"
        data={data}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        smallMultiples="sm1"
        layers={
          [
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
                maximizeFontSize: true,
              },
              shape: {
                fillColor: 'rgba(0, 0, 0, 0.07)',
              },
            },
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
                maximizeFontSize: true,
              },
              shape: { fillColor: 'rgba(0,0,0,0)' },
            },
            {
              groupByRollup: (d: Datum) => d.dest,
              nodeLabel: (d: any) => countryLookup[d].name,
              shape: {
                fillColor: (d: ShapeTreeNode) =>
                  discreteColor(colorBrewerCategoricalStark9, 0.3)(d[MODEL_KEY].parent.sortIndex),
              },
              fillLabel: { maximizeFontSize: true },
            },
          ] /* .slice(layerFrom, layerTo) */
        }
        config={{
          partitionLayout: PartitionLayout.treemap,
          linkLabel: {
            maxCount: 0,
            fontSize: 14,
          },
          fontFamily: 'Arial',
          fillLabel: {
            valueFormatter: (d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            fontStyle: 'italic',
            textInvertible: true,
            fontWeight: 900,
            valueFont: {
              fontFamily: 'Menlo',
              fontStyle: 'normal',
              fontWeight: 100,
            },
          },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
          minFontSize: 1,
          maxFontSize: 12,
          idealFontSizeJump: 1.1,
          backgroundColor: 'rgba(229,229,229,1)',
        }}
      />
      <Partition
        id="spec_2"
        data={data}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        smallMultiples="sm1"
        layers={
          [
            {
              groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
              nodeLabel: (d: any) => regionLookup[d].regionName,
              fillLabel: { maximizeFontSize: true },
              shape: {
                fillColor: (d: ShapeTreeNode) =>
                  discreteColor(colorBrewerCategoricalStark9, 0.5)(d[MODEL_KEY].sortIndex),
              },
            },
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: any) => productLookup[d].name,
              fillLabel: { maximizeFontSize: true },
              shape: {
                fillColor: (d: ShapeTreeNode) => discreteColor(colorBrewerCategoricalStark9, 0.7)(d.sortIndex),
              },
            },
            {
              groupByRollup: (d: Datum) => d.dest,
              nodeLabel: (d: any) => countryLookup[d].name,
              fillLabel: { maximizeFontSize: true },
              shape: {
                fillColor: (d: ShapeTreeNode) =>
                  discreteColor(colorBrewerCategoricalStark9, 0.3)(d[MODEL_KEY].parent.sortIndex),
              },
            },
          ] /* .slice(layerFrom, layerTo) */
        }
        config={{
          partitionLayout: PartitionLayout.sunburst,
          linkLabel: {
            maxCount: 0,
          },
          fontFamily: 'Arial',
          fillLabel: {
            valueFormatter: (d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            fontStyle: 'italic',
            textInvertible: true,
            fontWeight: 900,
            valueFont: {
              fontFamily: 'Menlo',
              fontStyle: 'normal',
              fontWeight: 100,
            },
          },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
          minFontSize: 1,
          idealFontSizeJump: 1.1,
          outerSizeRatio: 1,
          emptySizeRatio: 0,
          circlePadding: 4,
          backgroundColor: 'rgba(229,229,229,1)',
        }}
      />
    </Chart>
  );
};
