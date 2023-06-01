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
  CustomTooltip as CT,
  PartialTheme,
  defaultPartitionValueFormatter,
  Tooltip,
} from '@elastic/charts';
import { CHILDREN_KEY, entryValue, PARENT_KEY } from '@elastic/charts/src';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s, regionLookup } from '../utils/utils';

const CustomTooltip: CT = ({ values }) => (
  <div
    style={{
      padding: 10,
      minHeight: 40,
      backgroundColor: 'blue',
      color: 'white',
    }}
  >
    My Custom Tooltip:
    <br />
    {values.map(({ label }) => label)}
  </div>
);

const theme: PartialTheme = {
  partition: {
    linkLabel: {
      maxCount: 0,
      fontSize: 14,
    },
    fontFamily: 'Arial',
    fillLabel: {
      fontStyle: 'italic',
    },
    minFontSize: 1,
    idealFontSizeJump: 1.1,
    outerSizeRatio: 0.95,
    emptySizeRatio: 0,
    circlePadding: 4,
  },
};

export const Example = () => {
  return (
    <Chart>
      <Settings showLegend legendMaxDepth={1} theme={theme} baseTheme={useBaseTheme()} />
      <Tooltip
        placement={customKnobs.enum.placement('Tooltip placement')}
        fallbackPlacements={customKnobs.enum.fallbackPlacements()}
        boundary={customKnobs.enum.boundary()}
        customTooltip={boolean('Custom Tooltip', false) ? CustomTooltip : undefined}
      />
      <Partition
        id="spec_1"
        data={mocks.sunburst}
        layout={PartitionLayout.sunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
            nodeLabel: (d: any) => regionLookup[d].regionName,
            fillLabel: {
              fontFamily: 'Impact',
              valueFormatter: (d: number) =>
                `$${defaultPartitionValueFormatter(Math.round(d / 1000000000000))}\u00A0Tn`,
            },
            shape: {
              fillColor: (key, sortIndex, node) => {
                // concat all leaf and define the color based on the index of the fist children
                const rootTree = node[PARENT_KEY][CHILDREN_KEY].flatMap((d) => entryValue(d)[CHILDREN_KEY]);
                const index = rootTree.findIndex((d) => entryValue(d) === entryValue(node[CHILDREN_KEY][0]));
                return indexInterpolatedFillColor(interpolatorCET2s(0.8))(null, index, rootTree);
              },
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d].name,
            shape: {
              fillColor: (key, sortIndex, node) => {
                // concat all leaf and define the color based on their index
                const rootTree = node[PARENT_KEY][PARENT_KEY][CHILDREN_KEY].flatMap((d) => entryValue(d)[CHILDREN_KEY]);
                const index = rootTree.findIndex((d) => entryValue(d) === node);

                return indexInterpolatedFillColor(interpolatorCET2s(0.8))(null, index, rootTree);
              },
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
