/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Goal, Settings } from '@elastic/charts';
import { BandFillColorAccessorInput } from '@elastic/charts/src/chart_types/goal_chart/specs';
import { GoalSubtype } from '@elastic/charts/src/chart_types/goal_chart/specs/constants';

import { Color } from '../../../packages/charts/src/common/colors';
import { useBaseTheme } from '../../use_base_theme';

const subtype = GoalSubtype.Goal;

const colorMap: { [k: number]: Color } = {
  200: '#fc8d62',
  250: 'lightgrey',
  300: '#66c2a5',
};

const bandFillColor = (x: number): Color => colorMap[x];

export const Example = () => {
  const reverse = boolean('reverse', false);
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Goal
        id="spec"
        subtype={subtype}
        base={0}
        target={260}
        actual={280}
        bands={[200, 250, 300]}
        angleStart={reverse ? -Math.PI / 4 : Math.PI + Math.PI / 4}
        angleEnd={reverse ? Math.PI + Math.PI / 4 : -Math.PI / 4}
        tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
        bandFillColor={({ value }: BandFillColorAccessorInput) => bandFillColor(value)}
        labelMajor=""
        labelMinor=""
        centralMajor="280 MB/s"
        centralMinor=""
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `Leaving \`ticks\` as undefined will automatically create a linear ticks array given the domain`,
};
