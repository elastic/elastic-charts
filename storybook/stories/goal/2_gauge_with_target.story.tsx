/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number, color, array, boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Goal, Settings } from '@elastic/charts';
import { BandFillColorAccessorInput } from '@elastic/charts/src/chart_types/goal_chart/specs';
import { GoalSubtype } from '@elastic/charts/src/chart_types/goal_chart/specs/constants';

import { Color } from '../../../packages/charts/src/common/colors';

const subtype = GoalSubtype.Goal;

export const Example = () => {
  const base = number('base', 0, { range: true, min: 0, max: 300, step: 1 });
  const target = number('target', 260, { range: true, min: 0, max: 300, step: 1 });
  const actual = number('actual', 170, { range: true, min: 0, max: 300, step: 1 });
  const ticks = array('ticks', ['0', '50', '100', '150', '200', '250', '300']).map(Number);
  const bands = array('bands', ['200', '250', '300']).map(Number);

  const opacityMap: { [k: string]: number } = {
    '200': 0.2,
    '250': 0.12,
    '300': 0.05,
  };

  const useColors = boolean('use custom band colors', false, 'colors');
  const colorMap: { [k: number]: Color } = bands.reduce<{ [k: number]: Color }>((acc, band) => {
    const defaultValue = opacityMap[band] ?? 0;
    acc[band] = color(`color at ${band}`, `rgba(0,0,0,${defaultValue.toFixed(2)})`, 'colors');
    return acc;
  }, {});

  const bandFillColor = (x: number): Color => colorMap[x];

  return (
    <Chart>
      <Settings />
      <Goal
        id="spec_1"
        subtype={subtype}
        base={base}
        target={target}
        actual={actual}
        bands={bands}
        ticks={ticks}
        tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
        bandFillColor={useColors ? ({ value }: BandFillColorAccessorInput) => bandFillColor(value) : undefined}
        labelMajor="Revenue 2020 YTD  "
        labelMinor="(thousand USD)  "
        centralMajor={`${actual}`}
        centralMinor=""
        config={{ angleStart: Math.PI, angleEnd: 0 }}
      />
    </Chart>
  );
};
