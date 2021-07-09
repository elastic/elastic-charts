/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Goal } from '../../packages/charts/src';
import { BandFillColorAccessorInput } from '../../packages/charts/src/chart_types/goal_chart/specs';
import { GoalSubtype } from '../../packages/charts/src/chart_types/goal_chart/specs/constants';
import { Color } from '../../packages/charts/src/utils/common';

const subtype = GoalSubtype.Goal;

const colorMap: { [k: number]: Color } = {
  200: '#fc8d62',
  250: 'lightgrey',
  300: '#66c2a5',
};

const bandFillColor = (x: number): Color => colorMap[x];

export const Example = () => (
  <Chart className="story-chart">
    <Goal
      id="spec_1"
      subtype={subtype}
      base={0}
      target={260}
      actual={280}
      bands={[200, 250, 300]}
      ticks={[0, 50, 100, 150, 200, 250, 265, 280]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
      bandFillColor={({ value }: BandFillColorAccessorInput) => bandFillColor(value)}
      labelMajor=""
      labelMinor=""
      centralMajor="280 MB/s"
      centralMinor=""
      config={{ angleStart: Math.PI + Math.PI / 2, angleEnd: -Math.PI / 2 }}
    />
  </Chart>
);
