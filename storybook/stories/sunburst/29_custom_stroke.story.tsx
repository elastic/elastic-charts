/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color } from '@storybook/addon-knobs';
import React from 'react';

import type { Datum, PartialTheme, Color } from '@elastic/charts';
import { Chart, Partition, PartitionLayout, Settings, defaultPartitionValueFormatter } from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';

const getColorKnob = (prop: string, defaultColor: Color) =>
  boolean(`custom ${prop}`, false) ? color(prop, defaultColor) : undefined;

export const Example: ChartsStory = (_, { title, description }) => {
  const theme: PartialTheme = {
    background: {
      color: color('background.color', '#1c1c24'),
      fallbackColor: getColorKnob('background.fallbackColor', 'black'),
    },
    partition: {
      linkLabel: {
        maxCount: 15,
        textColor: getColorKnob('linkLabel.textColor', 'white'),
      },
      fillLabel: {
        textColor: getColorKnob('fillLabel.textColor', 'white'),
      },
      sectorLineWidth: 1.2,
    },
  };

  const fillColor = getColorKnob('shape.fillColor', 'blue');
  return (
    <Chart title={title} description={description}>
      <Settings theme={theme} baseTheme={useBaseTheme()} />
      <Partition
        id="spec_1"
        data={mocks.manyPie}
        layout={PartitionLayout.sunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.origin,
            nodeLabel: (d: Datum) => countryLookup[d].name,
            shape: {
              fillColor:
                fillColor ??
                ((key, sortIndex, node, tree) =>
                  indexInterpolatedFillColor(interpolatorCET2s(0.8))(null, sortIndex, tree)),
            },
          },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  theme: { default: 'dark' },
  background: { disable: true },
};
