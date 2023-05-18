/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Goal, Settings } from '@elastic/charts';
import { BandFillColorAccessorInput } from '@elastic/charts/src/chart_types/goal_chart/specs';
import { GoalSubtype } from '@elastic/charts/src/chart_types/goal_chart/specs/constants';

import { useBaseTheme } from '../../use_base_theme';
import { getBandFillColorFn } from '../utils/utils';

const subtype = GoalSubtype.Goal;

const getBandFillColor = getBandFillColorFn({
  199: 'rgba(255,0,0,0.5)',
  201: 'white',
  249: 'lightgrey',
  251: 'white',
  300: 'rgba(0,255,0,0.5)',
});

export const Example = () => {
  const showTarget = boolean('show target', true);
  const target = number('target', 260);

  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Goal
        id="spec_1"
        subtype={subtype}
        base={0}
        target={showTarget ? target : undefined}
        actual={280}
        domain={{ min: 0, max: 300 }}
        bands={[199, 201, 249, 251, 300]}
        ticks={[0, 50, 100, 150, 200, 250, 300]}
        tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
        bandFillColor={getBandFillColor}
        labelMajor="Revenue 2020 YTD  "
        labelMinor="(thousand USD)  "
        centralMajor="280"
        centralMinor={showTarget ? `target: ${target}` : undefined}
      />
    </Chart>
  );
};
