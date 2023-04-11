/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Goal, Color, BandFillColorAccessorInput, Settings } from '@elastic/charts';
import { GoalSubtype } from '@elastic/charts/src/chart_types/goal_chart/specs/constants';

import { useBaseTheme } from '../../use_base_theme';

const subtype = GoalSubtype.Goal;

const colorMap: { [k: number]: Color } = {
  200: '#fc8d62',
  250: 'lightgrey',
  300: '#66c2a5',
};

const bandFillColor = (x: number): Color => colorMap[x]!;

export const Example = () => (
  <Chart>
    <Settings baseTheme={useBaseTheme()} />
    <Goal
      id="spec_1"
      subtype={subtype}
      base={0}
      target={260}
      actual={280}
      domain={{ min: 0, max: 300 }}
      bands={[200, 250, 300]}
      ticks={[0, 50, 100, 150, 200, 250, 300]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
      bandFillColor={({ value }: BandFillColorAccessorInput) => bandFillColor(value)}
      labelMajor=""
      labelMinor=""
      centralMajor="280 MB/s"
      centralMinor=""
      angleStart={-(Math.PI - (2 * Math.PI) / 3) / 2}
      angleEnd={(Math.PI - (2 * Math.PI) / 3) / 2}
    />
  </Chart>
);
