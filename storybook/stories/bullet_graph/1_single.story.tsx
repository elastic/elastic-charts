/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { text, number, boolean } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { Chart, Bullet, BulletSubtype, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const bulletTitle = text('title', 'Error rate', 'General');
  const subtitle = text('subtitle', '', 'General');
  const value = number('value', 56, { range: true, min: -200, max: 200 }, 'General');
  const target = number('target', 75, { range: true, min: -200, max: 200 }, 'General');
  const start = number('start', 0, { range: true, min: -200, max: 200 }, 'General');
  const end = number('end', 100, { range: true, min: -200, max: 200 }, 'General');
  const format = text('format (numeraljs)', '0.[0]', 'General');
  const formatter = (d: number) => numeral(d).format(format);
  const subtype = getKnobFromEnum('subtype', BulletSubtype, BulletSubtype.horizontal, { group: 'General' });

  const niceDomain = boolean('niceDomain', false, 'Ticks');
  const tickStrategy = customKnobs.multiSelect(
    'tick strategy',
    {
      Auto: 'auto',
      TickCount: 'count',
      TickPlacements: 'placements',
    },
    'auto',
    'select',
    'Ticks',
  );
  const ticks = number('ticks(approx. count)', 5, { min: 0, step: 1 }, 'Ticks');
  const tickPlacements = customKnobs.numbersArray(
    'ticks(placements)',
    [-200, -100, 0, 5, 10, 15, 20, 25, 50, 100, 200],
    undefined,
    'Ticks',
  );

  return (
    <Chart title={title} description={description}>
      <Settings debug={debug} baseTheme={useBaseTheme()} />
      <Bullet
        id="bullet"
        subtype={subtype}
        data={[
          [
            {
              target,
              value,
              title: bulletTitle,
              subtitle,
              domain: [start, end],
              niceDomain,
              ticks:
                tickStrategy[0] === 'count' ? ticks : tickStrategy[0] === 'placements' ? tickPlacements : undefined,
              valueFormatter: formatter,
              tickFormatter: formatter,
            },
          ],
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  resize: {
    width: 500,
    height: 500,
    boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
    borderRadius: '6px',
  },
};
