/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { Datum, PartialTheme } from '@elastic/charts';
import { Chart, Partition, PartitionLayout, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { colorBrewerCategoricalStark9, discreteColor } from '../utils/utils';

const categories = ['Security', 'Analytics', 'Collaboration'];
const subcategories = ['Starter', 'Pro', 'Enterprise'];
const segments = ['New', 'Renewal', 'Expansion'];
const values = [100, 150, 120]; // segments shares

const data = categories.flatMap((category) =>
  subcategories.flatMap((subcategory) =>
    segments.map((segment, j) => ({
      category,
      subcategory,
      segment,
      value: values[j],
    })),
  ),
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

export const Example: ChartsStory = (_, { title, description }) => {
  return (
    <Chart title={title} description={description}>
      <Settings showLegend legendStrategy="pathWithDescendants" theme={theme} baseTheme={useBaseTheme()} />
      <Partition
        id="spec_1"
        data={data}
        layout={PartitionLayout.sunburst}
        valueAccessor={(d: Datum) => d.value as number}
        valueFormatter={(d: number) => `${d}`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.category,
            nodeLabel: (d: any) => d,
            shape: {
              fillColor: (key, sortIndex) => discreteColor(colorBrewerCategoricalStark9, 0.7)(sortIndex),
            },
          },
          {
            groupByRollup: (d: Datum) => d.subcategory,
            nodeLabel: (d: any) => d,
            shape: {
              fillColor: (key, sortIndex, node) =>
                discreteColor(colorBrewerCategoricalStark9, 0.5)(node.parent.sortIndex),
            },
          },
          {
            groupByRollup: (d: Datum) => d.segment,
            nodeLabel: (d: any) => d,
            shape: {
              fillColor: (key, sortIndex, node) =>
                discreteColor(colorBrewerCategoricalStark9, 0.3)(node.parent.parent.sortIndex),
            },
          },
        ]}
      />
    </Chart>
  );
};
