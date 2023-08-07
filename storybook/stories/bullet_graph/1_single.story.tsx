/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { text, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, BulletGraph, BulletGraphSubtype, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const subtype = getKnobFromEnum('subtype', BulletGraphSubtype, BulletGraphSubtype.horizontal);
  const bulletTitle = text('title', 'Error rate');
  const subtitle = text('subtitle', '');
  const value = number('value', 56, { range: true, min: 0, max: 200 });
  const target = number('target', 75, { range: true, min: 0, max: 200 });
  const min = number('min', 0, { range: true, min: 0, max: 200 });
  const max = number('max', 100, { range: true, min: 0, max: 200 });

  const postfix = text('postfix', '');
  return (
    <div
      style={{
        resize: 'both',
        padding: '0px',
        overflow: 'auto',
        width: 480,
        height: 120,
        boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
        borderRadius: '6px',
      }}
    >
      <Chart title={title} description={description}>
        <Settings baseTheme={useBaseTheme()} />
        <BulletGraph
          id="bubbles"
          subtype={subtype}
          data={[
            [
              {
                ticks: 'auto',
                target,
                value,
                title: bulletTitle,
                subtitle,
                domain: { min, max, nice: false },
                valueFormatter: (d) => `${d}${postfix}`,
                tickFormatter: (d) => `${d}${postfix}`,
              },
            ],
          ]}
        />
      </Chart>
    </div>
  );
};
