/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  AdditiveNumber,
  ArrayEntry,
  Chart,
  Datum,
  MODEL_KEY,
  Partition,
  PartitionLayout,
  Settings,
  ShapeTreeNode,
} from '@elastic/charts';
import { config } from '@elastic/charts/src/chart_types/partition_chart/layout/config';

import { useBaseTheme } from '../../use_base_theme';
import { countryLookup } from '../utils/utils';

const categoricalColors = ['rgb(110,110,110)', 'rgb(123,123,123)', 'darkgrey', 'lightgrey'];

const data = [
  { region: 'Americas', dest: 'usa', other: false, exportVal: 553359100104 },
  { region: 'Americas', dest: 'Other', other: true, exportVal: 753359100104 },
  { region: 'Asia', dest: 'chn', other: false, exportVal: 392617281424 },
  { region: 'Asia', dest: 'jpn', other: false, exportVal: 177490158520 },
  { region: 'Asia', dest: 'kor', other: false, exportVal: 177421375512 },
  { region: 'Asia', dest: 'Other', other: true, exportVal: 277421375512 },
  { region: 'Europe', dest: 'deu', other: false, exportVal: 253250650864 },
  { region: 'Europe', dest: 'smr', other: false, exportVal: 135443006088 },
  { region: 'Europe', dest: 'Other', other: true, exportVal: 205443006088 },
  { region: 'Africa', dest: 'Other', other: true, exportVal: 305443006088 },
];

export const Example = () => {
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Partition
        id="spec_1"
        data={data}
        valueAccessor={(d: Datum) => d.exportVal as AdditiveNumber}
        valueFormatter={(d: number) => `${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.region,
            nodeLabel: (d) => String(d).toUpperCase(),
            fillLabel: {
              valueFormatter: () => ``,
              fontWeight: 600,
            },
            shape: {
              fillColor: () => 'white',
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d]?.name ?? d,
            sortPredicate: ([name1, node1]: ArrayEntry, [name2, node2]: ArrayEntry) => {
              if (name1 === 'Other' && name2 !== 'Other') return -1;
              if (name2 === 'Other' && name1 !== 'Other') return 1;

              // otherwise, use the increasing value order
              return node1.value - node2.value;
            },
            fillLabel: {
              fontWeight: 100,
              maxFontSize: 16,
              valueFont: {
                fontFamily: 'Menlo',
                fontStyle: 'normal',
                fontWeight: 100,
              },
            },
            shape: {
              fillColor: (d: ShapeTreeNode) => categoricalColors.slice(0)[d[MODEL_KEY].sortIndex],
            },
          },
        ]}
        config={{
          partitionLayout: PartitionLayout.mosaic,
        }}
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
