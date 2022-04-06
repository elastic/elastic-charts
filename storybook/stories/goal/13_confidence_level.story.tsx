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

const subtype = GoalSubtype.Goal;

const colorMap: { [k: number]: Color } = {
  210: 'rgb(232,232,232)',
  218: '#66c2a4',
  224: '#2ca25f',
  229: '#006d2c',
  235: '#2ca25f',
  243: '#66c2a4',
  300: 'rgb(232,232,232)',
};

const bandFillColor = (x: number): Color => colorMap[x];

export const Example = () => (
  <Chart>
    <Settings baseTheme={useBaseTheme()} />
    <Goal
      id="spec_1"
      subtype={subtype}
      base={0}
      target={226.5}
      actual={0}
      domain={{ min: 0, max: 300 }}
      bands={[210, 218, 224, 229, 235, 243, 300]}
      ticks={[0, 50, 100, 150, 200, 250, 300]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
      bandFillColor={({ value }: BandFillColorAccessorInput) => bandFillColor(value)}
      labelMajor=""
      labelMinor=""
      centralMajor="226.5"
      centralMinor=""
    />
  </Chart>
);
