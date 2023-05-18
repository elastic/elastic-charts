/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Goal, Settings } from '@elastic/charts';
import { GoalSubtype } from '@elastic/charts/src/chart_types/goal_chart/specs/constants';

import { useBaseTheme } from '../../use_base_theme';
import { getBandFillColorFn } from '../utils/utils';

const getBandFillColor = getBandFillColorFn({
  200: '#fc8d62',
  250: 'lightgrey',
  300: '#66c2a5',
});

export const Example = () => {
  const start = number('startAngle (π)', 1.5, { min: -2, max: 2, step: 1 / 8 });
  const end = number('endAngle (π)', -0.5, { min: -2, max: 2, step: 1 / 8 });
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Goal
        id="spec_1"
        subtype={GoalSubtype.Goal}
        base={0}
        target={260}
        actual={280}
        domain={{ min: 0, max: 300 }}
        bands={[200, 250, 300]}
        ticks={[0, 50, 100, 150, 200, 250, 265, 280]}
        tickValueFormatter={({ value }) => String(value)}
        bandFillColor={getBandFillColor}
        labelMajor=""
        labelMinor=""
        centralMajor="280 MB/s"
        centralMinor=""
        angleStart={start * Math.PI}
        angleEnd={end * Math.PI}
      />
    </Chart>
  );
};
