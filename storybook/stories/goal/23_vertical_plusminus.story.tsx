/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Goal, Settings } from '@elastic/charts';
import { BandFillColorAccessorInput } from '@elastic/charts/src/chart_types/goal_chart/specs';
import { GoalSubtype } from '@elastic/charts/src/chart_types/goal_chart/specs/constants';

import { Color } from '../../../packages/charts/src/common/colors';
import { useBaseTheme } from '../../use_base_theme';

const q1 = 255 - 255 * 0.4;
const q2 = 255 - 255 * 0.25;
const q3 = 255 - 255 * 0.1;

const subtype = GoalSubtype.VerticalBullet;

const colorMap: { [k: number]: Color } = {
  '-100': 'lightcoral',
  0: 'indianred',
  200: `rgb(${q1},${q1},${q1})`,
  250: `rgb(${q2},${q2},${q2})`,
  300: `rgb(${q3},${q3},${q3})`,
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
      actual={-80}
      domain={{ min: -200, max: 300 }}
      bands={[-200, -100, 0, 200, 250, 300]}
      ticks={[-200, -100, 0, 100, 200, 300]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
      bandFillColor={({ value }: BandFillColorAccessorInput) => bandFillColor(value)}
      labelMajor="Revenue 2020 YTD  "
      labelMinor="(thousand USD)  "
      centralMajor="-80"
      centralMinor="target: 260"
    />
  </Chart>
);
