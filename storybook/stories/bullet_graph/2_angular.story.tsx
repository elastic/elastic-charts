/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { text, number, boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, BulletGraph, BulletGraphSubtype, Settings, BulletGraphSize } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const bulletTitle = text('title', 'A Nice Title');
  const subtitle = text('subtitle', 'Subtitle');
  const value = number('value', 56, { range: true, min: 0, max: 200 });
  const target = number('target', 75, { range: true, min: 0, max: 200 });
  const min = number('min', 0, { range: true, min: 0, max: 200 });
  const max = number('max', 100, { range: true, min: 0, max: 200 });
  const tickSnapStep = number('active tick step', 0, { min: 0, max: 10 });
  const angularTickLabelPadding = number('tick label padding', 10, { range: true, min: 0, max: 50 });
  const size = getKnobFromEnum('size', BulletGraphSize, 'two-thirds');
  const reverse = boolean('reverse', false);

  const postfix = text('postfix', '');
  return (
    <div
      style={{
        resize: 'both',
        padding: '0px',
        overflow: 'auto',
        width: 480,
        height: 420,
        boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
        borderRadius: '6px',
      }}
    >
      <Chart title={title} description={description}>
        <Settings
          theme={{
            bulletGraph: {
              angularTickLabelPadding,
            },
          }}
          baseTheme={useBaseTheme()}
          debug={debug}
        />
        <BulletGraph
          id="bubbles"
          subtype={BulletGraphSubtype.angular}
          size={size}
          tickSnapStep={tickSnapStep}
          data={[
            [
              {
                ticks: 'auto',
                target,
                value,
                title: bulletTitle,
                subtitle,
                reverse,
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
