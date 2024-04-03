/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, text } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { Chart, Bullet, BulletSubtype, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const format = text('format', '0');
  const formatter = (d: number) => numeral(d).format(format);
  const subtype = getKnobFromEnum('subtype', BulletSubtype, BulletSubtype.vertical);

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} debug={debug} />
      <Bullet
        id="bubbles"
        subtype={subtype}
        data={[
          [
            {
              target: 85,
              value: 23,
              title: 'CPU',
              domain: [0, 100],
              valueFormatter: formatter,
              tickFormatter: formatter,
            },
            {
              target: 75,
              value: 98,
              title: 'Memory',
              // subtitle: 'percent',
              domain: [0, 100],
              valueFormatter: formatter,
              tickFormatter: formatter,
            },
            {
              target: 25,
              value: 35.5,
              title: 'Network In',
              subtitle: 'bandwidth',
              domain: [0, 200],
              valueFormatter: formatter,
              tickFormatter: formatter,
            },
            {
              target: 25,
              value: 91,
              title: 'Network out',
              subtitle: 'available (percent)',
              domain: [0, 100],
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
    width: 600,
    height: 270,
    boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
    borderRadius: '6px',
  },
};
