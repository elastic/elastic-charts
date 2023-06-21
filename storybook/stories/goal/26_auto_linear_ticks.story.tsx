/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { array, boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Goal, Settings } from '@elastic/charts';
import { BandFillColorAccessorInput } from '@elastic/charts/src/chart_types/goal_chart/specs';
import { GoalSubtype } from '@elastic/charts/src/chart_types/goal_chart/specs/constants';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const subtype = customKnobs.fromEnum('subtype', GoalSubtype, GoalSubtype.VerticalBullet);
  const reverse = boolean('reverse', false);
  const start = number('angleStart (π)', 5 / 4, { min: -2, max: 2, step: 1 / 8 });
  const end = number('angleEnd (π)', -1 / 4, { min: -2, max: 2, step: 1 / 8 });
  const base = number('base', 0);
  const target = number('target', 260);
  const actual = number('actual', 280);
  const min = number('domain min', 0, { min: 0, step: 50 });
  const max = number('domain max', 300, { min, step: 50 });
  const autoTicks = boolean('auto generate ticks', true);
  const ticks = autoTicks ? undefined : array('ticks', ['0', '100', '200', '300']).map(Number);
  const autoBands = boolean('auto generate bands', true);
  const bands = autoBands ? undefined : array('bands', ['200', '250', '300']).map(Number);

  const angleStart = start * Math.PI;
  const angleEnd = end * Math.PI;

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Goal
        id="spec"
        subtype={subtype}
        base={base}
        target={target}
        actual={actual}
        ticks={ticks}
        bands={bands}
        domain={{ min, max }}
        angleStart={reverse ? angleEnd : angleStart}
        angleEnd={reverse ? angleStart : angleEnd}
        tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
        labelMajor="Speed average"
        labelMinor={subtype === GoalSubtype.Goal ? '' : `${actual} MB/s`}
        centralMajor={`${actual} MB/s`}
        centralMinor=""
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `Leaving \`ticks\` and/or \`bands\` as \`undefined\` will automatically generate linear values given the specified domain.
If \`ticks\` and/or \`bands\` is set to \`[]\` (empty array), no ticks or bands will be displayed, respectively`,
};
