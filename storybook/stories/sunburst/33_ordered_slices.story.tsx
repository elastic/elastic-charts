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
  AdditiveNumber,
  ArrayEntry,
  Chart,
  Datum,
  Partition,
  Settings,
  defaultPartitionValueFormatter,
} from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { discreteColor, countryLookup, colorBrewerCategoricalPastel12B } from '../utils/utils';

const categoricalColors = colorBrewerCategoricalPastel12B.slice(3);

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

const sortPredicate = ([name1, node1]: ArrayEntry, [name2, node2]: ArrayEntry) => {
  // unconditionally put "Other" to the end (as the "Other" slice may be larger than a regular slice, yet should be at the end)
  if (name1 === 'Other' && name2 !== 'Other') return 1;
  if (name2 === 'Other' && name1 !== 'Other') return -1;

  // otherwise, use the decreasing value order
  return node2.value - node1.value;
};

/* Equivalent, since math ops cleanly coerce false, true to 0, 1
const sortPredicate = ([name1, node1]: ArrayEntry, [name2, node2]: ArrayEntry) =>
  (name1 === 'Other') - (name2 === 'Other') || node2.value - node1.value;
*/

export const Example = () => {
  const sortPredicateEnabled = boolean('Move "Other" to end', true);
  const clockwiseSectors = boolean('clockwiseSectors', true);
  const specialFirstInnermostSector = boolean('specialFirstInnermostSector', false);

  return (
    <Chart>
      <Settings
        theme={{
          partition: { outerSizeRatio: 0.96 },
        }}
        baseTheme={useBaseTheme()}
      />
      <Partition
        id="spec_1"
        data={data}
        valueAccessor={(d: Datum) => d.exportVal as AdditiveNumber}
        valueFormatter={(d: number) => `${defaultPartitionValueFormatter(Math.round(d / 1000000000))}`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.region,
            nodeLabel: (d: any) => d,
            fillLabel: {
              valueFormatter: (d: number) => `${defaultPartitionValueFormatter(Math.round(d / 1000000000))}`,
              fontWeight: 600,
              fontStyle: 'italic',
              valueFont: {
                fontFamily: 'Menlo',
                fontStyle: 'normal',
                fontWeight: 100,
              },
            },
            shape: {
              fillColor: (key, sortIndex) => discreteColor(categoricalColors)(sortIndex),
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d]?.name ?? d,
            sortPredicate: sortPredicateEnabled ? sortPredicate : null,
            fillLabel: {
              fontWeight: 600,
              fontStyle: 'italic',
              maxFontSize: 16,
              valueFont: {
                fontFamily: 'Menlo',
                fontStyle: 'normal',
                fontWeight: 100,
              },
            },
            shape: {
              fillColor: (key, sortIndex, node) => discreteColor(categoricalColors, 0.5)(node.parent.sortIndex),
            },
          },
        ]}
        clockwiseSectors={clockwiseSectors}
        specialFirstInnermostSector={specialFirstInnermostSector}
      />
    </Chart>
  );
};
